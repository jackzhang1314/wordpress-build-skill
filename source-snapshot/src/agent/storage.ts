import type { SeoPublishingState } from './connections/publishing-tools';
import type { SeoState } from './connections/seo-tools';
import type { MapsJob } from './connections/maps';
import { isVisionReady, requireVisionConnection } from './vision-policy';
import { VISION_MODEL } from './vision';
import { conversationDeliveries } from './files/deliveries';
import type { DeliveryGroup } from './files/model';
import { z } from 'zod';
import type { ApprovalRecord } from './harness/approvals';
import type { HarnessState } from './harness/ledger';
import type { ContextCheckpoint } from './context/manager';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ModelMessage } from 'ai';
import type { SkillSession } from './skills/model';
import { hasDataConsent } from './data-consent';
import { configViewSchema, defaults, modelProfileSchema, settingsSchema, type Conversation, type Settings } from './model';

export interface StoredConversation extends SeoState, SeoPublishingState { mapsJob?: MapsJob; conversation: Conversation; modelMessages: ModelMessage[]; context?: ContextCheckpoint; harness?: HarnessState; approvals?: ApprovalRecord[]; skills?: SkillSession; runContext?: { includeNotes: boolean } }
interface AgentDB extends DBSchema {
  conversations: { key: string; value: StoredConversation };
  deliveries: { key: string; value: DeliveryGroup };
  summaries: { key: string; value: Conversation };
}
export function conversationSummary(conversation: Conversation): Conversation {
  return { ...conversation, messages: [], pendingMessages: undefined, questions: undefined };
}
export class ConversationStore {
  private db?: Promise<IDBPDatabase<AgentDB>>;
  constructor(private name = 'page-notes-agent') {}
  private open() {
    return this.db ??= openDB<AgentDB>(this.name, 3, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) db.createObjectStore('conversations', { keyPath: 'conversation.id' });
        if (oldVersion < 2) {
          const summaries = db.createObjectStore('summaries', { keyPath: 'id' });
          // One-time cursor migration: retain every full record and avoid loading all bodies at once.
          void (async () => {
            let cursor = await transaction.objectStore('conversations').openCursor();
            while (cursor) { await summaries.put(conversationSummary(cursor.value.conversation)); cursor = await cursor.continue(); }
          })().catch(() => transaction.abort());
        }
        if (oldVersion < 3) {
          const deliveries = db.createObjectStore('deliveries', { keyPath: 'id' });
          void (async () => {
            let cursor = await transaction.objectStore('conversations').openCursor();
            while (cursor) { await deliveries.put(conversationDeliveries(cursor.value.conversation)); cursor = await cursor.continue(); }
          })().catch(() => transaction.abort());
        }
      },
      blocking: () => { void this.db?.then(db => db.close()); },
    });
  }
  async get(id: string): Promise<StoredConversation | undefined> { return (await this.open()).get('conversations', id); }
  async put(value: StoredConversation): Promise<void> {
    const transaction = (await this.open()).transaction(['conversations', 'summaries', 'deliveries'], 'readwrite');
    await Promise.all([transaction.objectStore('conversations').put(value), transaction.objectStore('summaries').put(conversationSummary(value.conversation)), transaction.objectStore('deliveries').put(conversationDeliveries(value.conversation)), transaction.done]);
  }
  async list(): Promise<Conversation[]> {
    return (await (await this.open()).getAll('summaries')).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async deliveries(id?: string): Promise<DeliveryGroup[]> {
    const db = await this.open();
    // Existing v3 indexes contain publication times. Join lightweight summaries so
    // both old and newly saved deliveries follow conversation activity immediately.
    const transaction = db.transaction(['deliveries', 'summaries'], 'readonly');
    const [groups, summaries] = id === undefined
      ? await Promise.all([transaction.objectStore('deliveries').getAll(), transaction.objectStore('summaries').getAll()])
      : await Promise.all([
        transaction.objectStore('deliveries').get(id).then(item => item ? [item] : []),
        transaction.objectStore('summaries').get(id).then(item => item ? [item] : []),
      ]);
    await transaction.done;
    const activity = new Map(summaries.map(item => [item.id, item.updatedAt]));
    return groups.filter(item => item.files.length > 0)
      .map(item => ({ ...item, updatedAt: activity.get(item.id) ?? item.updatedAt }))
      .sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
  }
  async remove(id: string): Promise<void> {
    const transaction = (await this.open()).transaction(['conversations', 'summaries', 'deliveries'], 'readwrite');
    await Promise.all([transaction.objectStore('conversations').delete(id), transaction.objectStore('summaries').delete(id), transaction.objectStore('deliveries').delete(id), transaction.done]);
  }
  async close(): Promise<void> { if (this.db) (await this.db).close(); }
}
const CONFIG = 'agent-settings', KEY = 'agent-api-key';
const AUTO_DEFAULT_MIGRATION = 'agent-auto-default-v1';
export async function loadSettings(): Promise<Settings> {
  const value: Record<string, unknown> = await chrome.storage.local.get(CONFIG);
  const parsed = settingsSchema.safeParse(value[CONFIG]);
  if (!parsed.success) return { ...defaults };
  const marker = 'agent-vision-default-v1';
  const migrated = await chrome.storage.local.get(marker);
  if (!migrated[marker]) {
    const officialFlash = parsed.data.provider === 'deepseek' && new URL(parsed.data.baseURL).hostname === 'api.deepseek.com' && parsed.data.model === 'deepseek-v4-flash';
    if (officialFlash) parsed.data.model = VISION_MODEL;
    await chrome.storage.local.set({ [marker]: true, ...(officialFlash ? { [CONFIG]: parsed.data } : {}) });
  }
  if (!(await chrome.storage.local.get(AUTO_DEFAULT_MIGRATION))[AUTO_DEFAULT_MIGRATION]) {
    // Upgrade the former confirmation default once; later explicit choices stay intact.
    if (parsed.data.mode === 'confirm') parsed.data.mode = 'auto';
    await chrome.storage.local.set({ [AUTO_DEFAULT_MIGRATION]: true, [CONFIG]: parsed.data });
  }
  return parsed.data;
}
export async function loadKey(): Promise<string> {
  const session: Record<string, unknown> = await chrome.storage.session.get(KEY);
  if (typeof session[KEY] === 'string') return session[KEY];
  const local: Record<string, unknown> = await chrome.storage.local.get(KEY);
  return typeof local[KEY] === 'string' ? local[KEY] : '';
}
export async function configuration() {
  const settings = await loadSettings(), key = await loadKey();
  return configViewSchema.parse({ ...settings, hasKey: Boolean(key), dataSharing: await hasDataConsent(settings), visionReady: await isVisionReady(settings, key) });
}
export async function resolveKey(settings: Settings, supplied?: string): Promise<string> {
  if (supplied) return supplied;
  const previous = await loadSettings();
  if (previous.baseURL !== settings.baseURL || previous.provider !== settings.provider) return '';
  return loadKey();
}
export async function saveSettings(settings: Settings, supplied?: string, clearKey = false): Promise<void> {
  const apiKey = clearKey ? '' : await resolveKey(settings, supplied);
  if (!clearKey) await requireVisionConnection(settings, apiKey);
  const existing: Record<string, unknown> = await chrome.storage.local.get(CONFIG);
  const old = settingsSchema.safeParse(existing[CONFIG]);
  if (old.success) await rememberProfile(old.data, await loadKey());
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await chrome.storage.local.set({ [CONFIG]: settingsSchema.parse(settings), [AUTO_DEFAULT_MIGRATION]: true });
  await chrome.storage.local.remove(KEY); await chrome.storage.session.remove(KEY);
  if (apiKey) await (settings.rememberKey ? chrome.storage.local : chrome.storage.session).set({ [KEY]: apiKey });
  await rememberProfile(settings, apiKey);
}


// Profiles expose connection metadata only. Credentials stay in trusted storage,
// shared by provider + endpoint so clearing a key clears all model variants there.
const PROFILES = 'agent-model-profiles';
const savedProfileSchema = settingsSchema.extend({ id: z.string().uuid() });
const credentialName = (settings: Settings): string => `agent-model-key:${encodeURIComponent(JSON.stringify([settings.provider, settings.baseURL]))}`;
const sameModel = (a: Settings, b: Settings): boolean => a.provider === b.provider && a.baseURL === b.baseURL && a.model === b.model;
async function savedProfiles() {
  const raw: Record<string, unknown> = await chrome.storage.local.get(PROFILES);
  const parsed = z.array(savedProfileSchema).safeParse(raw[PROFILES]);
  return parsed.success ? parsed.data : [];
}
async function profileKey(settings: Settings): Promise<string> {
  const name = credentialName(settings);
  const session: Record<string, unknown> = await chrome.storage.session.get(name);
  const local: Record<string, unknown> = await chrome.storage.local.get(name);
  return typeof session[name] === 'string' ? session[name] : typeof local[name] === 'string' ? local[name] : '';
}
async function rememberProfile(settings: Settings, key: string): Promise<void> {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  const profiles = await savedProfiles(), found = profiles.find(item => sameModel(item, settings));
  const profile = { ...settingsSchema.parse(settings), id: found?.id ?? crypto.randomUUID() };
  const next = profiles.filter(item => item.id !== profile.id).map(item => credentialName(item) === credentialName(settings) ? { ...item, rememberKey: settings.rememberKey } : item);
  await chrome.storage.local.set({ [PROFILES]: [...next, profile] });
  const name = credentialName(settings);
  await chrome.storage.local.remove(name); await chrome.storage.session.remove(name);
  if (key) await (settings.rememberKey ? chrome.storage.local : chrome.storage.session).set({ [name]: key });
}
export async function listModelProfiles() {
  const settings = await loadSettings();
  // Upgrade the pre-profile configuration without requiring users to save again.
  await rememberProfile(settings, await loadKey());
  const profiles = await Promise.all((await savedProfiles()).map(async profile => {
    const key = await profileKey(profile);
    return await isVisionReady(profile, key) ? modelProfileSchema.parse({ ...profile, hasKey: Boolean(key), active: sameModel(profile, settings) }) : undefined;
  }));
  return profiles.filter(profile => profile !== undefined);
}
export async function selectModelProfile(id: string) {
  const profile = (await savedProfiles()).find(item => item.id === id);
  if (!profile) throw new Error('模型连接已不存在，请重新打开列表。');
  const key = await profileKey(profile);
  if (!key) throw new Error('此模型尚未配置密钥，请在模型连接中填写。');
  if (!await chrome.permissions.contains({ origins: [`${new URL(profile.baseURL).origin}/*`] })) throw new Error('此连接的网站权限已撤销，请在模型连接中重新保存并授权。');
  // Execution rules are global preferences, not part of a model switch.
  await saveSettings({ ...profile, mode: (await loadSettings()).mode }, key);
  return configuration();
}
