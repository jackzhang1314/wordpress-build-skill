import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { mediaMime, uploadMedia } from '../src/media.js';

test('media signatures reject executables disguised as images and unsupported SVG', () => {
  assert.throws(() => mediaMime('photo.png', Buffer.from('<?php echo 1;')));
  assert.throws(() => mediaMime('photo.svg', Buffer.from('<svg></svg>')));
  assert.equal(mediaMime('document.pdf', Buffer.from('%PDF-1.7')), 'application/pdf');
});

test('multipart upload verifies metadata and same-task retry reuses the actual media ID', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-media-'));
  try {
    const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8ZkAAAAASUVORK5CYII=', 'base64');
    const file = join(dir, 'fixture.png');
    await writeFile(file, bytes);
    let uploads = 0;
    const metadata = { id: 42, source_url: 'https://example.com/fixture.png', mime_type: 'image/png', media_type: 'image', title: { raw: 'Fixture' }, alt_text: 'One pixel fixture', caption: { raw: 'Test only' } };
    const client = new WordPressClient({ site: 'https://example.com', username: 'editor', password: 'fixture' }, async (_url, options) => {
      if (options?.method === 'POST') {
        uploads++;
        assert.equal(options.redirect, 'error');
        assert.ok(options.body instanceof FormData);
        assert.equal(options.body.get('alt_text'), metadata.alt_text);
        const upload = options.body.get('file');
        assert.ok(upload instanceof Blob);
        assert.equal(upload.type, 'image/png');
        assert.equal(upload.size, bytes.length);
        assert.equal(new Headers(options.headers).has('Content-Type'), false);
        return new Response(JSON.stringify(metadata));
      }
      return new Response(JSON.stringify(String(_url).includes('users/me') ? { capabilities: { upload_files: true } } : metadata));
    });
    const input = { file, title: 'Fixture', alt: 'One pixel fixture', caption: 'Test only' };
    const first = await uploadMedia(client, new Journal(dir, client.identity), input);
    const second = await uploadMedia(client, new Journal(dir, client.identity), input);
    assert.equal(first.id, 42);
    assert.equal(second.id, 42);
    assert.equal(uploads, 1);
    await assert.rejects(uploadMedia(client, new Journal(dir, client.identity), { ...input, alt: 'Changed' }), /different input/);
    assert.equal(uploads, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
