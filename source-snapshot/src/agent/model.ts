import { failureSchema, ProductError, normalizeFailure } from '../lib/product-error';
import { videoSourcesSchema } from './video/model';
import { modelBrandChoices } from './model-brand';
import { modelCatalog, providerIds } from './model-catalog';
import { imageAttachmentsSchema, VISION_MODEL } from './vision';
import { z } from 'zod';
import { answerQuestionSchema, questionRequestSchema } from './question-model';
import { artifactSchema, fileCommands } from './files/model';
import { skillCommands, skillRefSchema } from './skills/model';

export const providerSchema = z.enum(providerIds);
export const settingsSchema = z.object({
  provider: providerSchema.default('deepseek'),
  baseURL: z.string().url().transform(value => value.replace(/\/+$/, '')).refine(value => {
    const url = new URL(value);
    return !url.username && !url.password && !url.search && !url.hash &&
      (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)));
  }, 'API 地址需要 HTTPS；本机测试可用 HTTP。不要包含账号、查询参数或密钥。'),
  model: z.string().trim().min(1).max(150),
  modelBrand: z.enum(modelBrandChoices).optional(),
  mode: z.enum(['confirm', 'auto', 'read']).default('auto'),
  rememberKey: z.boolean().default(true),
});
export type Settings = z.infer<typeof settingsSchema>;
export const defaults: Settings = { provider: 'deepseek', baseURL: 'https://api.deepseek.com', model: VISION_MODEL, mode: 'auto', rememberKey: true };
export const presets = modelCatalog;
export const configViewSchema = settingsSchema.extend({ hasKey: z.boolean(),dataSharing:z.boolean().default(false), visionReady: z.boolean().optional() });
export const modelProfileSchema = settingsSchema.extend({ id: z.string().uuid(), hasKey: z.boolean(), active: z.boolean() });
export const cardSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('plan'), title: z.string().max(150), steps: z.array(z.object({ text: z.string().max(300), status: z.enum(['pending', 'doing', 'done']) })).min(1).max(12) }),
  z.object({ kind: z.literal('table'), title: z.string().max(150), columns: z.array(z.string().max(100)).min(1).max(8), rows: z.array(z.array(z.string().max(1000)).max(8)).max(100) }),
  z.object({ kind: z.literal('summary'), title: z.string().max(150), text: z.string().max(6000), links: z.array(z.object({ label: z.string().max(150), url: z.string().url().refine(v => /^https?:/.test(v)) })).max(15).default([]) }),
]);
export type Card = z.infer<typeof cardSchema>;
export const toolPartSchema = z.object({ kind: z.literal('tool'), id: z.string(), name: z.string(), input: z.string(), state: z.enum(['running', 'approval', 'done', 'error', 'unknown', 'denied']), result: z.string().optional(), image: z.string().startsWith('data:image/').optional(), startedAt: z.number().optional(), finishedAt: z.number().optional() });
export type ToolPart = z.infer<typeof toolPartSchema>;
export const partSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string() }), toolPartSchema,
  z.object({ kind: z.literal('reasoning'), text: z.string(), state: z.enum(['streaming', 'completed', 'interrupted']) }),
  z.object({ kind: z.literal('card'), card: cardSchema }),
  z.object({ kind: z.literal('file'), artifact: artifactSchema }),
]);
export const noteSnapshotSchema = z.string().min(1).max(240000);
export const pageSnapshotSchema = z.object({ mode: z.enum(['current', 'selected']), tabs: z.array(z.object({ id: z.number().int().nonnegative(), title: z.string().max(1024), url: z.string().max(4096) })).max(51) });
export const pageContextSchema = z.object({ videos: videoSourcesSchema.optional(), pageSnapshot: pageSnapshotSchema.optional(), usePage: z.boolean(), tabId: z.number().int().nonnegative().optional(), windowId: z.number().int(), additionalTabIds: z.array(z.number().int().nonnegative()).max(50) }).refine(value => !value.usePage || value.tabId !== undefined, '网页消息必须指定目标标签页');
export const messageFilesSchema = z.array(artifactSchema).max(50);
export const chatMessageSchema = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), files: messageFilesSchema.optional(), skills: z.array(skillRefSchema).max(4).optional(), pageContext: pageContextSchema.optional(), images: imageAttachmentsSchema.optional(), notes: noteSnapshotSchema.optional(), parts: z.array(partSchema), createdAt: z.number(), finishedAt: z.number().optional(), finishReason: z.literal('steered').optional(), resultParts: z.array(z.number().int().nonnegative()).optional(), outcome: z.enum(['completed', 'paused', 'cancelled', 'failed', 'interrupted']).optional() });
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const stateSchema = z.enum(['idle', 'running', 'awaiting-approval', 'paused', 'interrupted', 'completed', 'failed', 'cancelled']);
export type PageContext = z.infer<typeof pageContextSchema>;
export const queuedMessageSchema = z.object({ files: messageFilesSchema.optional(), pageContext: pageContextSchema.optional(), id: z.string().uuid(), text: z.string().trim().min(1).max(16000), createdAt: z.number(), delivery: z.enum(['queued', 'steer']), images: imageAttachmentsSchema.optional(), notes: noteSnapshotSchema.optional(), skills: z.array(skillRefSchema).max(4).optional() });
export type QueuedMessage = z.infer<typeof queuedMessageSchema>;
export const queueCommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('agent:enqueue'), files: messageFilesSchema.optional(), pageContext: pageContextSchema.optional(), images: imageAttachmentsSchema.optional(), notes: noteSnapshotSchema.optional(), id: z.string().uuid(), messageId: z.string().uuid(), prompt: z.string().trim().min(1).max(16000) }),
  z.object({ type: z.literal('agent:queue-edit'), id: z.string().uuid(), messageId: z.string().uuid(), prompt: z.string().trim().min(1).max(16000) }),
  z.object({ type: z.literal('agent:queue-remove'), id: z.string().uuid(), messageId: z.string().uuid() }),
  z.object({ type: z.literal('agent:queue-steer'), id: z.string().uuid(), messageId: z.string().uuid() }),
  z.object({ type: z.literal('agent:queue-reorder'), id: z.string().uuid(), messageIds: z.array(z.string().uuid()).max(20) }),
]);
export type QueueCommand = z.infer<typeof queueCommandSchema>;
export const conversationSchema = z.object({
  id: z.string().uuid(), title: z.string(), pinned: z.boolean().optional(), updatedAt: z.number(), messages: z.array(chatMessageSchema), state: stateSchema,
  activePageContext: pageContextSchema.optional(), tabId: z.number().optional(), pageTitle: z.string().optional(), url: z.string().optional(), windowId: z.number().optional(),
  steps: z.number().default(0), tokens: z.number().default(0), error: z.string().optional(),
  pendingMessages: z.array(queuedMessageSchema).optional(),
  questions: z.array(questionRequestSchema).optional(),
  permissionOrigin: z.string().url().refine(value => { const url = new URL(value); return /^https?:$/.test(url.protocol) && value === url.origin; }).optional(),
});
export type Conversation = z.infer<typeof conversationSchema>;
export const taskScopeSchema = z.object({ groupId: z.number(), title: z.string(), tabs: z.array(z.object({ id: z.number(), title: z.string(), url: z.string() })) }).nullable();
export const commandSchema = z.discriminatedUnion('type', [
  ...queueCommandSchema.options,
  answerQuestionSchema,
  ...skillCommands,
  ...fileCommands,
  z.object({ type: z.literal('agent:run-queue'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:scope'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:include-tab'), id: z.string().uuid(), tabId: z.number().int().nonnegative() }),
  z.object({ type: z.literal('agent:release-group'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:config') }),
  z.object({ type: z.literal('agent:models') }),
  z.object({ type: z.literal('agent:select-model'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:edit-conversation'), id: z.string().uuid(), title: z.string().trim().min(1).max(150).optional(), pinned: z.boolean().optional() }),
  z.object({ type: z.literal('agent:save-config'), settings: settingsSchema, apiKey: z.string().trim().max(2000).optional(), clearKey: z.boolean().optional(), dataSharing:z.boolean().optional() }),
  z.object({ type: z.literal('agent:test-config'), settings: settingsSchema, apiKey: z.string().trim().max(2000).optional() }),
  z.object({ type: z.literal('agent:list') }),
  z.object({ type: z.literal('agent:load'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:new') }),
  z.object({ type: z.literal('agent:delete'), id: z.string().uuid() }),
  z.object({ type: z.literal('agent:start'), videos: videoSourcesSchema.optional(), pageSnapshot: pageSnapshotSchema.optional(), files: messageFilesSchema.optional(), images: imageAttachmentsSchema.optional(), notes: noteSnapshotSchema.optional(), id: z.string().uuid(), prompt: z.string().trim().min(1).max(16000), tabId: z.number().int().nonnegative().optional(), windowId: z.number().int(), usePage: z.boolean(), additionalTabIds: z.array(z.number().int().nonnegative()).max(50).optional(), includeNotes: z.boolean(), resume: z.boolean().default(false) }),
  z.object({ type: z.literal('agent:stop'), id: z.string().uuid(), pause: z.boolean().default(false) }),
  z.object({ type: z.literal('agent:approve'), id: z.string().uuid(), toolId: z.string(), allow: z.boolean() }),
]);
export type AgentCommand = z.infer<typeof commandSchema>;
export const eventSchema = z.object({ type: z.literal('agent:update'), conversation: conversationSchema });
export const responseSchema = z.object({ ok: z.boolean(), failure: failureSchema.optional(), data: z.unknown().optional(), error: z.string().optional() });
export async function agentRPC(command: AgentCommand): Promise<unknown> {
  const response = responseSchema.parse(await chrome.runtime.sendMessage(command));
  if (!response.ok) throw new ProductError(response.failure ?? normalizeFailure(response.error));
  return response.data;
}
export function newConversation(): Conversation {
  return { id: crypto.randomUUID(), title: '新对话', updatedAt: Date.now(), messages: [], state: 'idle', steps: 0, tokens: 0 };
}
export function errorText(error: unknown, key = ''): string {
  const message = error instanceof Error ? error.message : String(error);
  return (key ? message.split(key).join('[API Key]') : message).replace(/Bearer\s+[^\s"']+/gi, 'Bearer [已隐藏]').slice(0, 1500);
}
