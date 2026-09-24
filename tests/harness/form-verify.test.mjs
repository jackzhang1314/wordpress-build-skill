import assert from 'node:assert/strict';
import test from 'node:test';
import {inspectFormHtml, submitFormInPage, verifyRfqForm} from '../../harness/lib/form-verify.mjs';

function fakePage({script = 'Thank you', formId = 8} = {}) {
  const calls = [];
  let evaluateCount = 0;
  return {
    calls,
    async navigate(url) {
      calls.push(['navigate', url]);
      return url;
    },
    async evaluate(expression) {
      calls.push(['evaluate', expression]);
      evaluateCount += 1;
      if (evaluateCount === 1) return true;
      if (evaluateCount === 2) return {ok: true, filled: ['full_name']};
      if (evaluateCount === 3) return true;
      if (evaluateCount === 4) return script;
      return formId;
    },
  };
}

test('inspectFormHtml requires one rendered Fluent Forms form', () => {
  const rendered = inspectFormHtml('<form id="fluentform_8" method="post"></form>');
  assert.equal(rendered.pass, true);
  assert.equal(rendered.formId, 8);

  const shortcode = inspectFormHtml('<p>[starter_rfq_form]</p>');
  assert.equal(shortcode.pass, false);
  assert.equal(shortcode.shortcodePresent, true);
});

test('submitFormInPage fills fields and waits for success text', async () => {
  const page = fakePage();
  const result = await submitFormInPage(page, {
    base: 'https://example.com',
    fields: {full_name: 'Test', email: 'test@example.com'},
    successText: 'Thank you',
  });
  assert.equal(result.success, true);
  assert.equal(result.formId, 8);
  assert.match(page.calls[2][1], /full_name/);
});

test('verifyRfqForm passes when submission increments Fluent Forms entries', async () => {
  const page = fakePage();
  const calls = [];
  const wp = args => {
    calls.push(args.join(' '));
    if (args[1].includes('MAX(id)')) {
      return JSON.stringify({id: 12, form_id: 8, status: 'unread', created_at: '2026-09-25 00:00:00'});
    }
    return calls.length <= 1 ? '1' : '2';
  };
  const fetchImpl = async () => ({
    status: 200,
    text: async () => '<form id="fluentform_8" method="post"></form>',
  });
  const result = await verifyRfqForm({
    base: 'https://example.com',
    route: '/contact/',
    browserPage: page,
    wp,
    fetchImpl,
  });
  assert.equal(result.pass, true);
  assert.deepEqual([result.before, result.after, result.increment], [1, 2, 1]);
  assert.equal(result.entry.id, 12);
});

test('verifyRfqForm fails when the entry count does not increase', async () => {
  const page = fakePage();
  let submissions = 1;
  const wp = args => {
    if (args[1].includes('MAX(id)')) return 'null';
    return String(submissions);
  };
  const fetchImpl = async () => ({
    status: 200,
    text: async () => '<form id="fluentform_8" method="post"></form>',
  });
  const result = await verifyRfqForm({
    base: 'https://example.com',
    browserPage: page,
    wp,
    fetchImpl,
    countTimeoutMs: 1,
  });
  assert.equal(result.pass, false);
  assert.equal(result.increment, 0);
});
