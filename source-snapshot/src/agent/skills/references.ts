import type { SkillInfo } from './model';
import { productFor } from './catalog';
export function inlineSkillPattern(): RegExp {
  return /\[((?:\\.|[^\]\\\r\n])*)\]\(skill:([a-z0-9]+(?:-[a-z0-9]+)*)\)/g;
}
/** A stable inline reference. Markdown renders the label; the agent receives the exact skill name. */
export function skillReference(info: SkillInfo): string {
  const label = productFor(info).title.replace(/[\r\n]+/g, ' ').replace(/[\\[\]]/g, '\\$&');
  return `[${label}](skill:${info.name})`;
}
export function skillNames(text: string): string[] {
  const matches = text.matchAll(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)(?=\s|$)|\[(?:\\.|[^\]\\\r\n])*\]\(skill:([a-z0-9]+(?:-[a-z0-9]+)*)\)/gm);
  return [...new Set([...matches].map(match => match[1] ?? match[2]).filter((name): name is string => name !== undefined))];
}
