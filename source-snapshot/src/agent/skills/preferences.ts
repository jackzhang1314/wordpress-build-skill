import { z } from 'zod';
const key = 'page-notes-skill-preferences-v1';
const schema = z.object({ favorites: z.array(z.string()).max(200), recent: z.array(z.string()).max(20) });
export type SkillPreferences = z.infer<typeof schema>;
export function loadSkillPreferences(): SkillPreferences {
  try { return schema.parse(JSON.parse(localStorage.getItem(key) ?? '{}')); }
  catch { return { favorites: [], recent: [] }; }
}
export function saveSkillPreferences(value: SkillPreferences): boolean {
  try { localStorage.setItem(key, JSON.stringify(schema.parse(value))); return true; }
  catch { return false; }
}
