import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assignTemplate, editPage, navAdd, navRemove, pushPost} from '../../harness/lib/maintenance.mjs';

function makeSite(options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'harness-maint-'));
  writeFileSync(join(root, 'project.json'), JSON.stringify({title: 'Demo', theme: 'demo-theme', plugin: 'demo-model'}));
  mkdir(join(root, 'theme'));
  const posts = options.posts ?? {};
  const items = options.items ?? [];
  const templates = {};
  let nextId = 50;
  const files = {};
  const evalCalls = [];
  const wpCalls = [];
  const ssh = {
    run: (command, opts = {}) => {
      const match = command.match(/^cat > (\S+)$/);
      if (match) files[match[1]] = String(opts.input ?? '');
      return '';
    },
    wp: args => {
      wpCalls.push(args);
      if (args[0] === 'post' && args[1] === 'list') {
        const slug = args.find(a => a.startsWith('--name='))?.slice(7);
        const type = args.find(a => a.startsWith('--post_type='))?.slice(12);
        const post = posts[`${type}:${slug}`];
        const rows = post ? [{ID: post.id, post_status: post.status, post_content: post.content, post_modified_gmt: post.modified}] : [];
        return JSON.stringify(rows);
      }
      if (args[0] === 'menu' && args[1] === 'list') {
        return JSON.stringify([{term_id: 2, slug: 'primary', name: 'Primary'}]);
      }
      if (args[0] === 'menu' && args[1] === 'item' && args[2] === 'list') {
        return JSON.stringify(items.map(item => ({db_id: item.id, title: item.title, url: item.url ?? ''})));
      }
      if (args[0] === 'post' && args[1] === 'meta') {
        const id = Number(args[3]);
        const key = Object.keys(posts).find(entry => posts[entry].id === id);
        return (key && templates[key.split(':')[1]]) ?? '';
      }
      if (args[0] === 'eval-file') {
        const [phpPath, jsonPath] = [args[1], args[2]];
        const php = files[phpPath];
        const payload = JSON.parse(files[jsonPath]);
        evalCalls.push({php, payload});
        if (php.includes('wp_update_nav_menu_item')) {
          items.push({id: ++nextId, title: payload.label, url: payload.url});
          return JSON.stringify({id: nextId});
        }
        if (php.includes('wp_delete_post')) {
          const before = items.length;
          for (let i = items.length - 1; i >= 0; i -= 1) {
            if (items[i].title === payload.label) items.splice(i, 1);
          }
          return JSON.stringify({removed: before - items.length});
        }
        if (php.includes('_wp_page_template')) {
          templates[payload.slug] = payload.template;
          return JSON.stringify({id: posts[`page:${payload.slug}`]?.id ?? 7, template: payload.template});
        }
        const key = `${payload.type}:${payload.slug}`;
        if (!posts[key]) {
          posts[key] = {id: ++nextId, status: payload.status ?? 'publish', content: payload.content, modified: 'now'};
        } else {
          posts[key].content = payload.content;
        }
        return JSON.stringify({id: posts[key].id});
      }
      throw new Error(`unexpected wp call: ${args.join(' ')}`);
    },
  };
  return {
    root,
    cleanup: () => rmSync(root, {recursive: true, force: true}),
    site: {root, project: {paths: {theme: 'theme'}}, ssh},
    posts, items, templates, evalCalls, files, wpCalls,
    setState: entries => writeFileSync(join(root, '.content-state.json'), JSON.stringify(entries)),
    getState: () => JSON.parse(readFileSync(join(root, '.content-state.json'), 'utf8')),
  };
}

function mkdir(path) {
  mkdirSync(path, {recursive: true});
}

test('edit-page refuses to overwrite a remote change it did not push', async () => {
  const env = makeSite({posts: {'page:home': {id: 1, status: 'publish', content: '<p>client edit</p>', modified: 'x'}}});
  try {
    writeFileSync(join(env.root, 'patch.html'), '<p>local</p>');
    await assert.rejects(
      editPage(env.site, ['home', '--file', 'patch.html']),
      /Manual edit conflict.*--adopt-remote/s,
    );
  } finally {
    env.cleanup();
  }
});

test('edit-page pushes cleanly when remote hash matches our recorded state', async () => {
  const env = makeSite({posts: {'page:home': {id: 1, status: 'publish', content: '<p>v1</p>', modified: 'x'}}});
  try {
    env.setState({'page:home': {hash: await hashOf('<p>v1</p>'), id: 1}});
    writeFileSync(join(env.root, 'patch.html'), '<p>v2</p>');
    const result = await editPage(env.site, ['home', '--file', 'patch.html']);
    assert.equal(result.action, 'push');
    assert.equal(env.posts['page:home'].content, '<p>v2</p>');
    assert.equal(env.getState()['page:home'].hash, await hashOf('<p>v2</p>'));
  } finally {
    env.cleanup();
  }
});

test('edit-page --adopt-remote takes over unknown remote content', async () => {
  const env = makeSite({posts: {'page:home': {id: 1, status: 'publish', content: '<p>remote</p>', modified: 'x'}}});
  try {
    writeFileSync(join(env.root, 'patch.html'), '<p>local</p>');
    const result = await editPage(env.site, ['home', '--file', 'patch.html', '--adopt-remote']);
    assert.equal(result.action, 'push');
    assert.equal(env.posts['page:home'].content, '<p>local</p>');
  } finally {
    env.cleanup();
  }
});

test('identical content is a no-op that only records state', async () => {
  const env = makeSite({posts: {'page:home': {id: 1, status: 'publish', content: '<p>same</p>', modified: 'x'}}});
  try {
    writeFileSync(join(env.root, 'patch.html'), '<p>same</p>');
    const result = await editPage(env.site, ['home', '--file', 'patch.html']);
    assert.equal(result.action, 'noop');
    assert.ok(!env.evalCalls.some(call => call.php.includes('wp_update_post')));
  } finally {
    env.cleanup();
  }
});

test('nav add and remove are surgical: siblings survive', async () => {
  const env = makeSite({items: [{id: 1, title: 'Home'}, {id: 2, title: 'About'}]});
  try {
    await navAdd(env.site, ['QA Check', '--url', '/about/']);
    assert.ok(env.items.some(item => item.title === 'QA Check'));
    assert.ok(env.items.some(item => item.title === 'Home'), 'Home must survive');
    await navRemove(env.site, ['QA Check']);
    assert.ok(!env.items.some(item => item.title === 'QA Check'));
    assert.ok(env.items.some(item => item.title === 'Home') && env.items.some(item => item.title === 'About'));
  } finally {
    env.cleanup();
  }
});

test('post push creates a missing article and records journal state', async () => {
  const env = makeSite();
  try {
    writeFileSync(join(env.root, 'article.json'), JSON.stringify({
      title: 'News', slug: 'hello-news', content: '<p>body</p>', type: 'post',
    }));
    const result = await pushPost(env.site, ['article.json']);
    assert.ok(result.id > 0);
    assert.ok(env.wpCalls.some(args => args.includes('--post_status=publish,draft,pending,private,future')),
      'fingerprint must see drafts (post_status=any skips them)');
    assert.equal(env.posts['post:hello-news'].content, '<p>body</p>');
    assert.equal(env.getState()['post:hello-news'].hash, await hashOf('<p>body</p>'));
  } finally {
    env.cleanup();
  }
});

test('template assign validates the body-render rule before touching remote', async () => {
  const env = makeSite({posts: {'page:home': {id: 1, status: 'publish', content: 'x', modified: 'x'}}});
  try {
    writeFileSync(join(env.root, 'theme/bad.php'), '<?php /* Template Name: Bad */ get_header(); ?>');
    writeFileSync(join(env.root, 'theme/good.php'), '<?php /* Template Name: Good */ the_content(); ?>');
    await assert.rejects(assignTemplate(env.site, ['home', '--template', 'bad.php']), /the_content/);
    const result = await assignTemplate(env.site, ['home', '--template', 'good.php']);
    assert.equal(env.templates.home, 'good.php');
    assert.equal(result.template, 'good.php');
  } finally {
    env.cleanup();
  }
});

async function hashOf(value) {
  const {createHash} = await import('node:crypto');
  return createHash('sha256').update(value).digest('hex');
}
