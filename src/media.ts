import { readFile, stat } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { WordPressClient } from './client.js';
import { Journal } from './journal.js';

export const mediaInput = z.object({ file: z.string().min(1), title: z.string().min(1).max(200), alt: z.string().max(500), caption: z.string().max(2000).default('') }).strict();
export const mediaSchema = z.object({ id: z.number().int().positive(), source_url: z.url(), mime_type: z.string(), media_type: z.enum(['image', 'file']), title: z.object({ raw: z.string() }), alt_text: z.string(), caption: z.object({ raw: z.string() }) });

export function mediaMime(filename: string, bytes: Uint8Array): string {
  const data = Buffer.from(bytes), ext = extname(filename).toLowerCase();
  if (ext === '.png' && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (['.jpg', '.jpeg'].includes(ext) && data[0] === 255 && data[1] === 216 && data[2] === 255) return 'image/jpeg';
  if (ext === '.webp' && data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (ext === '.pdf' && data.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  throw new Error('Supported uploads are PNG, JPEG, WebP and PDF with matching file signatures.');
}

export async function uploadMedia(client: WordPressClient, journal: Journal, input: z.infer<typeof mediaInput>) {
  const file = resolve(input.file), info = await stat(file);
  if (!info.isFile() || info.size === 0 || info.size > 10 * 1024 * 1024) throw new Error('Media file must be nonempty and at most 10 MiB.');
  const bytes = await readFile(file);
  if (bytes.length > 10 * 1024 * 1024) throw new Error('Media file changed beyond the size limit.');
  const mime = mediaMime(file, bytes);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const filename = basename(file).replace(/[^a-zA-Z0-9_.-]/g, '-');
  const metadata = { title: input.title, alt_text: input.alt, caption: input.caption };
  return journal.lock(async () => {
    const after = await journal.mutate(`media-${sha256}`, { sha256, filename, mime, metadata }, mediaSchema, async () => {
      const account = z.object({ capabilities: z.record(z.string(), z.boolean()) }).parse(await client.request('/wp/v2/users/me?context=edit'));
      if (!account.capabilities.upload_files) throw new Error('Current account cannot upload media.');
    }, () => client.upload(bytes, filename, mime, metadata), async raw => {
      const response = mediaSchema.parse(raw);
      const media = mediaSchema.parse(await client.request(`/wp/v2/media/${response.id}?context=edit`));
      if (media.id !== response.id || media.mime_type !== mime || media.title.raw !== input.title || media.alt_text !== input.alt || media.caption.raw !== input.caption) throw new Error('Media metadata readback mismatch; inspect the saved response.');
      return media;
    });
    const current = mediaSchema.parse(await client.request(`/wp/v2/media/${after.id}?context=edit`));
    if (current.id !== after.id || current.title.raw !== after.title.raw || current.alt_text !== after.alt_text || current.caption.raw !== after.caption.raw || current.mime_type !== after.mime_type) throw new Error('Media metadata changed after its receipt.');
    await journal.save(`media-${after.id}.json`, { sourceFile: file, sha256, media: current });
    return { id: current.id, url: current.source_url, mime: current.mime_type, title: current.title.raw, alt: current.alt_text, sha256, metadataMatches: true, frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
