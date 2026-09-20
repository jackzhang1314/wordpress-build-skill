import { builtinProducts } from './catalog';
export const titleFor = (name: string): string => builtinProducts[name]?.title ?? name;
export const descriptionFor = (name: string, fallback: string): string => builtinProducts[name]?.summary ?? fallback;
