import { zipSync } from 'fflate';
import { safePath, type SkillPackage } from './model';

/** Export the exact version shown in the detail panel, including sources and license. */
export function exportSkillPackage(skill: SkillPackage): Uint8Array<ArrayBuffer> {
  return zipSync(Object.fromEntries(skill.files.map(file => [safePath(file.path), Uint8Array.from(atob(file.data), char => char.charCodeAt(0))])));
}
