import { z } from 'zod';
import { skillProductSchema } from './catalog';
export const MAX_PACKAGE = 2 * 1024 * 1024;
export const MAX_BODY = 16000;
export const skillRefSchema = z.object({ name: z.string().min(1).max(64), version: z.string().min(1).max(80) });
export type SkillRef = z.infer<typeof skillRefSchema>;
export const skillFileSchema = z.object({ path: z.string().max(240), data: z.string().max(3 * 1024 * 1024) });
export type SkillFile = z.infer<typeof skillFileSchema>;
export const skillOriginSchema = z.object({ owner: z.string().regex(/^[\w-]+$/), repo: z.string().regex(/^[\w.-]+$/), commit: z.string().regex(/^[a-f0-9]{40}$/), path: z.string().max(1000) });
export type SkillOrigin = z.infer<typeof skillOriginSchema>;
export const skillInfoSchema = skillRefSchema.extend({ description: z.string().max(1024), source: z.enum(['builtin', 'imported']), enabled: z.boolean(), diagnostics: z.array(z.string()), compatibility: z.string().optional(), origin: skillOriginSchema.optional(), product: skillProductSchema.optional() });
export type SkillInfo = z.infer<typeof skillInfoSchema>;
export const skillPackageSchema = skillInfoSchema.extend({ body: z.string().max(MAX_BODY), files: z.array(skillFileSchema).max(64), metadata: z.record(z.string(), z.unknown()) });
export type SkillPackage = z.infer<typeof skillPackageSchema>;
export interface SkillSession { active: SkillPackage[]; requests: SkillRef[] }
export const skillCommands = [
  z.object({ type: z.literal('agent:skills-list') }),
  z.object({ type: z.literal('agent:skills-read'), ref: skillRefSchema }),
  z.object({ type: z.literal('agent:skills-import'), files: z.array(skillFileSchema).min(1).max(64), replaceVersion: z.string().optional(), origin: skillOriginSchema.optional() }),
  z.object({ type: z.literal('agent:skills-toggle'), name: z.string(), enabled: z.boolean() }),
  z.object({ type: z.literal('agent:skills-delete'), name: z.string() }),
] as const;
export function infoOf({ body: _body, files: _files, metadata: _metadata, ...info }: SkillPackage): SkillInfo {
  void _body; void _files; void _metadata; return info;
}
export function bytesToBase64(bytes: Uint8Array): string {
  let text = ''; for (let offset = 0; offset < bytes.length; offset += 8192) text += String.fromCharCode(...bytes.subarray(offset, offset + 8192)); return btoa(text);
}
export function fileText(file: SkillFile): string {
  const bytes = Uint8Array.from(atob(file.data), char => char.charCodeAt(0));
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('此文件不是 UTF-8 文本。资源已保存，当前不能向文本模型读取。'); }
  if (text.includes('\0')) throw new Error('此文件是二进制资源，当前只能读取 UTF-8 文本。');
  return text;
}
export function safePath(path: string): string {
  if (!path || path.length > 240 || /[\\:]/.test(path) || [...path].some(char => char.charCodeAt(0) < 32) || path.startsWith('/') || path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error(`技能文件路径不安全：${path.slice(0, 80)}`);
  return path;
}
