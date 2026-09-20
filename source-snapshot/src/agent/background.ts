import { pauseTaskSeoMonitors } from './connections/seo-monitors';
import { normalizeFailure } from '../lib/product-error';
import { validateVideoSources, videoManifest } from './video/evidence';
import { ConversationStreamEncoder, subscriptionSchema } from './conversation-stream';
import { isVisionReady, rejectTextModel, requireVisionConnection } from './vision-policy';
import { assertVisionModel, visionMessage } from './vision';
import { decideApproval, recoverApprovals } from './harness/approvals';
import { recoveryEvidence } from './context/manager';
import { ContextStore } from './context/store';
import { answerQuestion } from './questions';
import { AnnotationRuntime } from './annotations';
import type { WorkspaceStore } from '../lib/store';
import { FileStore } from './files/store';
import { FileRuntime } from './files/runtime';
import { importFiles } from './files/import';
import { SkillStore } from './skills/store';
import { SkillRuntime } from './skills/runtime';
import { consumeInbox, editInbox } from './inbox';
import { AgentRunner } from './runtime';
import { ConversationStore, conversationSummary, configuration, loadSettings, loadKey, resolveKey, saveSettings, listModelProfiles, selectModelProfile } from './storage';
import { commandSchema, queueCommandSchema, errorText, newConversation, type AgentCommand, type Conversation } from './model';
import { createModel, testConnection, originPattern } from './providers';
import { setDataConsent, requireDataConsent } from './data-consent';
import { BrowserDriver } from '../browser/driver';
import { TaskGroup } from '../browser/task-group';
import { storeSchema } from '../lib/store';
import { workspaceMarkdown } from '../lib/export';

export class AgentService {
  constructor(private annotationStore?: WorkspaceStore, private annotationsChanged?: (tabId: number) => Promise<void>) {}
  private store = new ConversationStore();
  private files = new FileStore();
  private skillStore?: SkillStore;
  private skills(): SkillStore { return this.skillStore ??= new SkillStore(); }
  private ports = new Set<chrome.runtime.Port>();
  private subscriptions = new WeakMap<chrome.runtime.Port, { id: string; encoder: ConversationStreamEncoder; published: boolean }>();
  private active?: AgentRunner;
  private starting = false;
  private execution?: Promise<void>;
  private controls: Promise<unknown> = Promise.resolve();
  private children = new Map<number, AgentRunner>();
  private publish = (conversation: Conversation): void => {
    for (const port of this.ports) {
      const subscription = this.subscriptions.get(port);
      if (subscription?.id !== conversation.id) continue;
      try { port.postMessage(subscription.encoder.encode(conversation)); subscription.published = true; } catch { this.ports.delete(port); }
    }
  };
  private async read(id: string) {
    if (this.active?.conversation.id === id) return { conversation: this.active.conversation };
    const stored = await this.store.get(id);
    if (!stored) throw new Error('对话不存在或已删除。');
    recoverApprovals(stored);
    const pendingApproval = stored.approvals?.some(item => item.state === 'pending');
    if (['running', 'awaiting-approval'].includes(stored.conversation.state)) {
      stored.conversation.state = pendingApproval ? 'awaiting-approval' : 'interrupted';
      stored.conversation.error = pendingApproval ? undefined : '扩展执行已中断。继续前会重新读取网页，不自动重放未确认结果的动作。';
      const last = stored.conversation.messages.at(-1);
      if (!pendingApproval && last?.role === 'assistant') { last.outcome = 'interrupted'; last.finishedAt ??= Date.now(); }
      for (const message of stored.conversation.messages) for (const part of message.parts) if (part.kind === 'tool' && ['running', 'approval'].includes(part.state) && !stored.approvals?.some(item => item.toolCallId === part.id && item.state === 'pending')) part.state = 'unknown';
      await this.store.put(stored);
    }
    return stored;
  }
  async notes(): Promise<string> {
    const data: Record<string, unknown> = await chrome.storage.local.get('page-notes-workspace');
    const workspace = storeSchema.safeParse(data['page-notes-workspace']);
    return workspace.success ? workspaceMarkdown(workspace.data.pages, false, false).slice(0, 22000) : '还没有保存的批注。';
  }
  handle(command: AgentCommand): Promise<unknown> {
    // Serialize short queue/start mutations, never the duration of an active run.
    if (command.type === 'agent:approve' || command.type === 'agent:answer-question' || command.type.startsWith('agent:skills-') || command.type === 'agent:files-restore' || command.type === 'agent:files-import' || command.type === 'agent:files-copy' || command.type === 'agent:delete' || command.type === 'agent:edit-conversation' || command.type === 'agent:save-config' || command.type === 'agent:select-model' || command.type === 'agent:models' || command.type === 'agent:start' || command.type === 'agent:run-queue' || queueCommandSchema.safeParse(command).success) {
      const operation = this.controls.catch(() => undefined).then(() => this.handleCommand(command));
      this.controls = operation; return operation;
    }
    return this.handleCommand(command);
  }
  private async dispatchQueue(id: string): Promise<unknown> {
    if (this.active || this.starting) throw new Error('请等待当前任务结束后发送排队消息。');
    const stored = await this.store.get(id); if (!stored?.conversation.pendingMessages?.length) throw new Error('没有待发送的消息。');
    const { conversation } = stored;
    if (conversation.windowId === undefined) throw new Error('请在输入框发送任务以恢复这段对话。');
    const page = conversation.pendingMessages?.[0]?.pageContext;
    return this.handleCommand({ type: 'agent:start', id, prompt: '', tabId: page ? page.tabId : conversation.tabId, windowId: page?.windowId ?? conversation.windowId, usePage: page ? page.usePage : conversation.tabId !== undefined, additionalTabIds: page?.additionalTabIds, pageSnapshot: page?.pageSnapshot, videos: page?.videos, includeNotes: stored.runContext?.includeNotes ?? false, resume: !page });
  }
  private async handleCommand(command: AgentCommand): Promise<unknown> {
    if (command.type === 'agent:deliveries') return this.store.deliveries(command.id);
    if (command.type === 'agent:files-copy') {
      if (command.id !== command.sourceId && (this.active || this.starting)) throw new Error('请先暂停当前任务，再从其他会话添加文件。');
      if (!await this.store.get(command.id) || !await this.store.get(command.sourceId)) throw new Error('来源或目标对话不存在或已删除。');
      return this.files.copyFrom(command.id, command.sourceId, command.file.path, command.file.version);
    }
    if (command.type === 'agent:files-import') {
      if (this.active || this.starting) throw new Error('请先暂停或停止当前任务，再导入文件。');
      if (!await this.store.get(command.id)) throw new Error('对话不存在或已删除。');
      return importFiles(this.files, command.id, command.files);
    }
    if (command.type === 'agent:files-list' || command.type === 'agent:files-read' || command.type === 'agent:files-history' || command.type === 'agent:files-restore') {
      if (!await this.store.get(command.id)) throw new Error('对话不存在或已删除。');
      if (command.type === 'agent:files-list') return this.files.list(command.id);
      if (command.type === 'agent:files-read') return this.files.read(command.id,command.path,command.version);
      if (command.type === 'agent:files-history') return this.files.history(command.id,command.path);
      if (this.active || this.starting) throw new Error('请先停止当前任务，再恢复文件版本。');
      return this.files.restore(command.id,command.path,command.version,command.expectedVersion);
    }
    if (command.type === 'agent:skills-list') return this.skills().list();
    if (command.type === 'agent:skills-read') return this.skills().get(command.ref);
    if (command.type === 'agent:skills-import' || command.type === 'agent:skills-toggle' || command.type === 'agent:skills-delete') {
      if (this.active || this.starting) throw new Error('请先停止当前任务，再修改技能库。排队和暂停任务会保留所选版本。');
      if (command.type === 'agent:skills-import') return this.skills().import(command.files, command.replaceVersion, command.origin);
      if (command.type === 'agent:skills-toggle') await this.skills().toggle(command.name, command.enabled);
      else await this.skills().remove(command.name);
      return true;
    }
    if (command.type === 'agent:answer-question') {
      if (this.active?.conversation.id === command.id && !this.active.acceptsMessages) await this.execution;
      const runner = this.active?.conversation.id === command.id ? this.active : undefined;
      if (runner) { await runner.answerQuestion(command); return structuredClone(runner.conversation); }
      const stored = await this.read(command.id);
      if (!('modelMessages' in stored)) throw new Error('任务正在切换，请重试。');
      const changed = answerQuestion(stored.conversation, command);
      stored.conversation.updatedAt = Math.max(Date.now(), stored.conversation.updatedAt + 1);
      await this.store.put(stored); this.publish(stored.conversation);
      if (changed && [command, ...(command.additional ?? [])].some(item => item.response.kind === 'answer') && !this.active && stored.conversation.state === 'completed' && !stored.conversation.permissionOrigin) {
        // A failed restart must not undo an accepted response; it remains in the inbox.
        try { return await this.dispatchQueue(command.id); }
        catch (error) { const latest = await this.store.get(command.id) ?? stored; latest.conversation.error = `回答已保存，请点击继续：${errorText(error)}`; await this.store.put(latest); this.publish(latest.conversation); return latest.conversation; }
      }
      return stored.conversation;
    }
    const queueCommand = queueCommandSchema.safeParse(command);
    if (queueCommand.success) {
      if (queueCommand.data.type === 'agent:enqueue' && queueCommand.data.pageContext) await validateVideoSources(queueCommand.data.id, queueCommand.data.pageContext);
      if (queueCommand.data.type === 'agent:enqueue') await requireVisionConnection(await loadSettings(), await loadKey());
      const skillRefs = 'prompt' in queueCommand.data ? await this.skills().resolve(queueCommand.data.prompt) : undefined;
      if (this.active?.conversation.id === queueCommand.data.id && !this.active.acceptsMessages) await this.execution;
      const runner = this.active?.conversation.id === queueCommand.data.id ? this.active : undefined;
      if (runner) {
        await runner.updateInbox(queueCommand.data, skillRefs);
        return structuredClone(runner.conversation);
      }
      const stored = await this.read(queueCommand.data.id);
      if (!('modelMessages' in stored)) throw new Error('任务正在切换，请重试。');
      editInbox(stored.conversation, queueCommand.data, skillRefs);
      stored.conversation.updatedAt = Math.max(Date.now(), stored.conversation.updatedAt + 1);
      await this.store.put(stored); this.publish(stored.conversation);
      // Handles Enter arriving just as the previous run finishes. Pauses remain explicit.
      if (!this.active && stored.conversation.pendingMessages?.length && stored.conversation.state === 'completed' && ['agent:enqueue', 'agent:queue-steer'].includes(command.type)) return this.dispatchQueue(stored.conversation.id);
      return stored.conversation;
    }
    if (command.type === 'agent:run-queue') {
      if (this.active?.conversation.id === command.id && !this.active.acceptsMessages) await this.execution;
      return this.dispatchQueue(command.id);
    }
    if (command.type === 'agent:scope' || command.type === 'agent:include-tab' || command.type === 'agent:release-group') {
      const group = await TaskGroup.find(command.id);
      if (command.type === 'agent:scope') return group ? group.view() : null;
      if (!group) throw new Error('请先选择网页并发送任务，建立任务分组。');
      if (command.type === 'agent:include-tab') await group.include(command.tabId);
      else {
        if (this.starting || this.active?.conversation.id === command.id) throw new Error('请先停止任务，再解除分组。');
        await group.release();
      }
      return true;
    }
    if (command.type === 'agent:config') return configuration();
    if (command.type === 'agent:models') return listModelProfiles();
    if (command.type === 'agent:select-model') {
      if (this.active || this.starting) throw new Error('请先暂停或停止任务，再切换模型。');
      return selectModelProfile(command.id);
    }
    if (command.type === 'agent:edit-conversation') {
      if (this.starting || this.active?.conversation.id === command.id) throw new Error('请先暂停或停止任务，再修改会话信息。');
      const stored = await this.store.get(command.id);
      if (!stored) throw new Error('对话不存在或已删除。');
      if (command.title !== undefined) stored.conversation.title = command.title;
      if (command.pinned !== undefined) stored.conversation.pinned = command.pinned;
      stored.conversation.updatedAt = Math.max(Date.now(), stored.conversation.updatedAt + 1);
      await this.store.put(stored); this.publish(stored.conversation); return stored.conversation;
    }
    if (command.type === 'agent:save-config' || command.type === 'agent:test-config') {
      if (!(await chrome.permissions.contains({ origins: [originPattern(command.settings.baseURL)] }))) throw new Error('请先授予所选 API 地址的访问权限。');
      if (command.type === 'agent:save-config') {
        if (!command.clearKey) {
          rejectTextModel(command.settings);
          const key = await resolveKey(command.settings, command.apiKey);
          if (!await isVisionReady(command.settings, key)) {
            try { await testConnection(command.settings, key); } catch (error) { throw new Error(errorText(error, key), { cause: error }); }
          }
        }
        await saveSettings(command.settings, command.apiKey, command.clearKey);
        if(command.dataSharing!==undefined){await setDataConsent(command.settings,command.dataSharing);if(!command.dataSharing)this.active?.stop(true);}
        return configuration();
      }
      const key = await resolveKey(command.settings, command.apiKey);
      try { return await testConnection(command.settings, key); } catch (error) { throw new Error(errorText(error, key), { cause: error }); }
    }
    if (command.type === 'agent:list') {
      const items = await this.store.list();
      return items.map(item => {
        if (this.active?.conversation.id === item.id) return conversationSummary(this.active.conversation);
        // Repair the full execution record only when it is opened, not for every history row.
        return ['running', 'awaiting-approval'].includes(item.state) ? { ...item, state: 'interrupted' as const } : item;
      });
    }
    if (command.type === 'agent:new') { const conversation = newConversation(); await this.store.put({ conversation, modelMessages: [] }); return conversation; }
    if (command.type === 'agent:load') return (await this.read(command.id)).conversation;
    if (command.type === 'agent:delete') {
      if (this.starting || this.active?.conversation.id === command.id) throw new Error('请先停止当前任务，再删除对话。');
      await pauseTaskSeoMonitors(command.id);
      await this.files.removeTask(command.id);
      const context = new ContextStore();
      try { await context.removeTask(command.id); } finally { await context.close(); }
      await TaskGroup.forget(command.id);
      await this.store.remove(command.id); return true;
    }
    if (command.type === 'agent:approve') {
      if (this.active?.conversation.id === command.id) { this.active.approve(command.toolId, command.allow); return true; }
      if (this.active || this.starting) throw new Error('请先停止其他正在执行的任务，再回答这项确认。');
      const stored = await this.store.get(command.id);
      if (!stored) throw new Error('对话不存在。');
      decideApproval(stored, command.toolId, command.allow); await this.store.put(stored);
      if (stored.conversation.windowId === undefined) throw new Error('确认已保存，请在原窗口继续任务。');
      try { await this.handleCommand({ type: 'agent:start', id: command.id, prompt: '', windowId: stored.conversation.windowId, tabId: stored.conversation.tabId, usePage: stored.conversation.tabId !== undefined, includeNotes: stored.runContext?.includeNotes ?? false, resume: true }); }
      catch (error) { stored.conversation.state = 'interrupted'; stored.conversation.error = `确认已保存，请继续任务：${errorText(error)}`; await this.store.put(stored); this.publish(stored.conversation); }
      return true;
    }
    if (command.type === 'agent:stop') { if (this.active?.conversation.id === command.id) this.active.stop(command.pause); return true; }
    if (command.type !== 'agent:start') throw new Error('不支持的消息操作。');
    if (this.active?.conversation.id === command.id && !this.active.acceptsMessages) await this.execution;
    if (this.active || this.starting) throw new Error('已有任务正在运行，请先暂停或停止它。');
    this.starting = true;
    try {
      const settings = await loadSettings(), apiKey = await loadKey(), model = createModel(settings, apiKey);
      await requireVisionConnection(settings, apiKey);
      await requireDataConsent(settings);
      assertVisionModel(settings.model, command.images);
      const stored = await this.store.get(command.id); if (!stored) throw new Error('对话不存在。');
      for (const item of stored.conversation.pendingMessages ?? []) assertVisionModel(settings.model, item.images);
      if (command.usePage && command.tabId === undefined) throw new Error('没有可用的任务网页。');
      const skillRefs = await this.skills().resolve(command.prompt);
      const catalog = await this.skills().list();
      const controller = new AbortController();
      const conversation = stored.conversation;
      if (command.resume && conversation.permissionOrigin && !(await chrome.permissions.contains({ origins: [originPattern(conversation.permissionOrigin)] }))) {
        throw new Error(`请先点击“授权此网站并继续”，授予 ${conversation.permissionOrigin} 的访问权限。`);
      }
      const pageContext = command.resume && conversation.activePageContext ? conversation.activePageContext : { videos: command.videos, pageSnapshot: command.pageSnapshot, usePage: command.usePage, tabId: command.tabId, windowId: command.windowId, additionalTabIds: command.additionalTabIds ?? [] };
      await validateVideoSources(command.id, pageContext);
      const group = command.usePage && command.tabId !== undefined ? await TaskGroup.open(command.id, command.tabId, command.windowId, command.resume, command.additionalTabIds) : undefined;
      const driver = group && command.tabId !== undefined ? new BrowserDriver(command.tabId, `agent:${command.id}`, command.windowId, controller.signal, group) : undefined;
      const resume = ['paused', 'interrupted', 'cancelled', 'failed'].includes(conversation.state);
      const consumed = consumeInbox(stored, false, command.prompt ? undefined : pageContext);
      if (skillRefs.length) (stored.skills ??= { active: [], requests: [] }).requests.push(...skillRefs);
      if (!command.prompt && !consumed && !stored.approvals?.some(item => item.state === 'approved' || item.state === 'denied')) throw new Error('没有待发送的消息。');
      if (command.prompt) conversation.messages.push({ id: crypto.randomUUID(), role: 'user', parts: [{ kind: 'text', text: command.prompt }], notes: command.notes, images: command.images, files: command.files, skills: skillRefs, pageContext, createdAt: Date.now() });
      if (conversation.title === '新对话') conversation.title = command.prompt.slice(0, 36);
      conversation.messages.push({ id: crypto.randomUUID(), role: 'assistant', parts: [], createdAt: Date.now() });
      conversation.state = 'running'; conversation.error = undefined; conversation.steps = 0; conversation.tokens = 0; conversation.windowId = command.windowId; conversation.tabId = command.usePage ? command.tabId : undefined;
      conversation.activePageContext = pageContext;
      conversation.permissionOrigin = undefined;
      if (command.prompt) stored.modelMessages.push(visionMessage(command.prompt, command.images));
      if (command.notes) stored.modelMessages.push({ role: 'user', content: command.notes });
      stored.modelMessages.push({ role: 'user', content: pageContext.videos?.length ? videoManifest(pageContext.videos) : command.usePage ? `本轮网页上下文已绑定：起始标签 ID 为 ${command.tabId}。本轮的“此网页 / 当前网页”指这个标签，请先读取实际网页再回答；之前轮次的纯对话状态或网页目标不适用于本轮。` : '本轮用户明确选择不使用网页。只处理本轮文字及附件，不沿用上轮网页目标。' });
      if (command.usePage && command.additionalTabIds?.length) stored.modelMessages.push({ role: 'user', content: `本轮通过网页选择器加入了多个网页。首个标签 ID 为 ${command.tabId}，额外标签 ID 为 ${[...new Set(command.additionalTabIds)].join('、')}。先用 listTabs 核对名称与来源，再按本轮任务读取这些网页；不能只处理当前页面。` });
      stored.runContext = { includeNotes: command.includeNotes };
      if (resume) stored.modelMessages.push({ role: 'user', content: '上轮执行已停止或中断。先重新观察网页，核实动作结果，禁止自动重放未知状态的提交。执行记录：' + await recoveryEvidence(stored) });
      if (command.includeNotes) stored.modelMessages.push({ role: 'user', content: '用户选择附带批注：\n' + await this.notes() });
      await this.store.put(stored);
      const runner = new AgentRunner({ stored, resume: command.resume === true, annotations: this.annotationStore ? new AnnotationRuntime(this.annotationStore, command.id, this.annotationsChanged) : undefined, files: new FileRuntime(this.files, command.id), skills: new SkillRuntime(stored, catalog, ref => this.skills().get(ref)), settings, model, apiKey, driver, signal: controller, save: value => this.store.put(value), publish: this.publish, notes: () => command.notes ? Promise.resolve(command.notes) : command.includeNotes ? this.notes() : Promise.resolve('本轮没有初始批注附件；若后续消息带有批注快照，请以那条消息为准。') });
      this.active = runner; this.publish(conversation);
      this.execution = runner.run().catch(error => { conversation.state = 'failed'; conversation.error = errorText(error, apiKey); this.publish(conversation); }).finally(() => { if (this.active === runner) this.active = undefined; for (const [id, owner] of this.children) if (owner === runner) this.children.delete(id);
        if (conversation.state === 'completed' && conversation.pendingMessages?.length) {
          void this.handle({ type: 'agent:run-queue', id: conversation.id }).catch(async error => {
            const latest = await this.store.get(conversation.id); if (!latest) return;
            latest.conversation.error = `排队消息已保留：${errorText(error)}`;
            await this.store.put(latest); this.publish(latest.conversation);
          });
        }
      });
      return conversation;
    } finally { this.starting = false; }
  }
  pauseWindow(windowId: number): void { if (this.active?.conversation.windowId === windowId) this.active.stop(true); }
  detached(tabId: number, reason = '目标网页已关闭或调试连接已断开，任务已暂停。'): void { if (this.active?.driver?.tabId === tabId && ['running', 'awaiting-approval'].includes(this.active.conversation.state)) this.active.stop(true, reason); }
  private async adoptChild(tab: chrome.tabs.Tab): Promise<void> {
    if (tab.id === undefined) return;
    const runner = this.children.get(tab.id), group = runner?.driver?.group;
    if (!runner || !group || runner !== this.active || runner.signal.aborted) { this.children.delete(tab.id); return; }
    if (!/^https?:/.test(tab.url ?? '') && !/^https?:/.test(tab.pendingUrl ?? '')) return;
    // Chrome may supply openerTabId only on the first onUpdated, after onCreated.
    if (tab.openerTabId === undefined) return;
    this.children.delete(tab.id);
    try {
      if (tab.groupId !== -1 && tab.groupId !== group.groupId) return;
      await group.assert(tab.openerTabId);
      if (runner !== this.active || runner.signal.aborted) return;
      await group.include(tab.id);
    } catch { /* Never take ownership of unrelated or already closed pages. */ }
  }
  install(): void {
    chrome.tabs.onCreated.addListener(tab => {
      if (tab.id !== undefined && this.active?.driver) {
        this.children.set(tab.id, this.active); void this.adoptChild(tab);
      }
    });
    chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
      const driver = this.active?.driver;
      if (driver?.tabId === tabId && change.groupId !== undefined && change.groupId !== driver.group.groupId) this.detached(tabId, '目标网页已移出任务分组，任务已暂停。加入网页后重新发送任务即可继续。');
      if (this.children.has(tabId)) void this.adoptChild(tab);
    });
    chrome.tabs.onDetached.addListener(tabId => this.detached(tabId, '目标网页已移到其他窗口，任务已暂停。'));
    chrome.tabs.onRemoved.addListener(tabId => this.children.delete(tabId));
    chrome.tabGroups.onRemoved.addListener(group => { if (this.active?.driver?.group.groupId === group.id) this.active.stop(true, '任务分组已解除或关闭，任务已暂停。请选择网页重新发送任务。'); });
    chrome.runtime.onConnect.addListener(port => {
      if (port.name !== 'agent-panel' || port.sender?.id !== chrome.runtime.id || port.sender.tab || !port.sender.url?.startsWith(chrome.runtime.getURL('sidepanel.html'))) return;
      this.ports.add(port); port.onDisconnect.addListener(() => this.ports.delete(port));
      port.onMessage.addListener((raw: unknown) => {
        const parsed = subscriptionSchema.safeParse(raw); if (!parsed.success) return;
        const subscription = { id: parsed.data.id, encoder: new ConversationStreamEncoder({ textAppend: parsed.data.textAppend === true }), published: false };
        this.subscriptions.set(port, subscription);
        void this.read(subscription.id).then(stored => {
          // A live publication has already supplied a newer initial snapshot.
          if (this.ports.has(port) && this.subscriptions.get(port) === subscription && !subscription.published) {
            port.postMessage(subscription.encoder.encode(stored.conversation)); subscription.published = true;
          }
        }).catch(() => { /* Load RPC reports missing conversations; a disconnected port has no consumer. */ });
      });
    });
    chrome.runtime.onMessage.addListener((raw: unknown, sender, reply) => {
      const parsed = commandSchema.safeParse(raw); if (!parsed.success) return false;
      if (sender.id !== chrome.runtime.id || sender.tab || !sender.url?.startsWith(chrome.runtime.getURL('sidepanel.html'))) { reply({ ok: false, error: '只能从插件侧栏调用 Agent。' }); return false; }
      void this.handle(parsed.data).then(data => reply({ ok: true, data })).catch((error: unknown) => reply({ ok: false, error: errorText(error), failure: normalizeFailure(error) }));
      return true;
    });
  }
}
