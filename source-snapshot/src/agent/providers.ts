import { rejectTextModel, requireVisionConnection, recordVisionVerification } from './vision-policy';
import { visionChallenge, verifyVisionAnswer } from './vision-probe';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { extractReasoningMiddleware, wrapLanguageModel, streamText, type LanguageModel } from 'ai';
import type { Settings } from './model';
import { requireDataConsent } from './data-consent';

export function originPattern(url: string): string { return `${new URL(url).origin}/*`; }
export function createModel(settings: Settings, apiKey: string): LanguageModel {
  return modelConnection(settings,apiKey,true);
}
function modelConnection(settings: Settings, apiKey: string, taskData: boolean): LanguageModel {
  if (!apiKey) throw new Error('请先打开模型设置，填写 API Key。');
  const origin = new URL(settings.baseURL).origin;
  const guardedFetch: typeof fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (new URL(url).origin !== origin) throw new Error('模型请求地址与已配置的 API 地址不一致。');
    if(taskData) { await requireVisionConnection(settings, apiKey); await requireDataConsent(settings); }
    return fetch(input, { ...init, credentials: 'omit', redirect: 'error' });
  };
  if (settings.provider === 'openrouter') return createOpenRouter({ apiKey, baseURL: settings.baseURL, fetch: guardedFetch, compatibility: 'strict' }).chat(settings.model);
  if (settings.provider === 'deepseek') return createDeepSeek({ apiKey, baseURL: settings.baseURL, fetch: guardedFetch })(settings.model);
  const model = createOpenAICompatible({ name: settings.provider, apiKey, baseURL: settings.baseURL, fetch: guardedFetch,
    transformRequestBody: (body: Record<string, unknown>) => adaptRequest(settings, body, !taskData),
  })(settings.model);
  // MiniMax's default protocol embeds reasoning in <think>. Let the official SDK
  // split it for rendering, and restore the same format for subsequent tool turns.
  return settings.provider === 'minimax' ? wrapLanguageModel({ model, middleware: extractReasoningMiddleware({ tagName: 'think', separator: '' }) }) : model;
}
export async function testConnection(settings: Settings, apiKey: string): Promise<string> {
  rejectTextModel(settings);
  if (!apiKey) throw new Error('请先填写 API Key，再验证识图能力。');
  const challenge = await visionChallenge();
  const result = streamText({ model: modelConnection(settings, apiKey, false), messages: [challenge.message], maxOutputTokens: 4096, maxRetries: 0, abortSignal: AbortSignal.timeout(60000),
    providerOptions: settings.provider === 'deepseek' ? { deepseek: { thinking: { type: 'disabled' } } } : undefined });
  let text = '';
  for await (const part of result.stream) {
    if (part.type === 'error') throw part.error;
    if (part.type === 'text-delta') text += part.text;
  }
  if (!text.trim()) throw new Error('API 已响应，但未返回文字。请检查模型名称及兼容接口配置。');
  verifyVisionAnswer(text, challenge.answer);
  await recordVisionVerification(settings, apiKey);
  return `${settings.model} · 连接成功，识图验证通过`;
}

/** Provider-specific options stay here so main Agent, quick actions and probes agree. */
export function adaptRequest(settings: Settings, input: Record<string, unknown>, probe = false): Record<string, unknown> {
  const body = { ...input };
  if (settings.provider === 'kimi') {
    if (['kimi-k3', 'kimi-k2.6', 'kimi-k2.7-code'].includes(settings.model)) {
      delete body.temperature; delete body.top_p;
      if (settings.model === 'kimi-k3') { delete body.thinking; body.reasoning_effort = probe ? 'low' : 'high'; }
      else if (settings.model === 'kimi-k2.6') { body.thinking = { type: 'disabled' }; delete body.reasoning_effort; }
      else { body.thinking = { type: 'enabled', keep: 'all' }; delete body.reasoning_effort; }
    }
  }
  if (settings.provider === 'glm' && settings.model === 'glm-5.3') {
    body.thinking = { type: 'enabled' }; body.reasoning_effort = probe ? 'low' : 'high';
  }
  if (settings.provider === 'qwen' && ['qwen3.8-flash', 'qwen3.7-flash', 'qwen3.7-plus'].includes(settings.model)) body.enable_thinking = false;
  if (settings.provider === 'minimax') {
    body.reasoning_split = false;
    if (Array.isArray(body.messages)) body.messages = body.messages.map((message: unknown) => {
      if (!isRecord(message) || message.role !== 'assistant' || typeof message.reasoning_content !== 'string') return message;
      const restored: Record<string, unknown> = { ...message, content: `<think>${message.reasoning_content}</think>${typeof message.content === 'string' ? message.content : ''}` };
      delete restored.reasoning_content;
      return restored;
    });
  }
  return body;
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
