/** Browser + database contract checks for the starter RFQ form. */

export function defaultRfqFields(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return {
    full_name: `Harness Verify ${stamp}`,
    email: `harness+${stamp}@example.com`,
    company: 'Starter Verification Co.',
    country: 'Automated test',
    product: 'Fresh-site deployment verification',
    message: `Automated RFQ verification submitted at ${now.toISOString()}.`,
  };
}

export function inspectFormHtml(html, route = '/contact/') {
  const shortcodePresent = /\[starter_rfq_form\]/.test(html);
  const forms = [...html.matchAll(/<form[^>]+id=["']fluentform_(\d+)["'][^>]*>/g)]
    .map(match => ({id: Number(match[1]), tag: match[0]}));
  const shortcodeRendered = forms.length > 0;
  return {
    route,
    shortcodePresent,
    formId: forms.at(-1)?.id ?? 0,
    formTag: forms.at(-1)?.tag ?? '',
    shortcodeRendered,
    pass: shortcodeRendered && forms.length === 1,
  };
}

/** Fill named fields and submit the first Fluent Forms form on the page. */
export async function submitFormInPage(page, {
  base,
  route = '/contact/',
  fields,
  successText = 'Thank you',
  timeoutMs = 20000,
  settleMs = 500,
} = {}) {
  const fieldJson = JSON.stringify(fields);
  await page.navigate(`${String(base).replace(/\/$/, '')}${route}`, {timeoutMs, settleMs: 500});
  const formDeadline = Date.now() + timeoutMs;
  let formFound = false;
  while (Date.now() < formDeadline) {
    formFound = await page.evaluate(`Boolean(document.querySelector('form[id^="fluentform_"]'))`);
    if (formFound) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!formFound) throw new Error('Fluent Forms form not found');

  const filled = await page.evaluate(`(() => {
    const form = document.querySelector('form[id^="fluentform_"]');
    if (!form) return {ok: false, reason: 'form not found', filled: []};
    const values = ${fieldJson};
    const filled = [];
    for (const [name, value] of Object.entries(values)) {
      const field = form.querySelector('[name="' + CSS.escape(name) + '"]');
      if (!field) continue;
      field.value = value;
      field.dispatchEvent(new Event('input', {bubbles: true}));
      field.dispatchEvent(new Event('change', {bubbles: true}));
      filled.push(name);
    }
    return {ok: filled.length > 0, filled};
  })()`);
  if (!filled?.ok) throw new Error(filled?.reason || 'No form fields could be filled');

  const submitted = await page.evaluate(`(() => {
    const form = document.querySelector('form[id^="fluentform_"]');
    const button = form?.querySelector('[type="submit"], .ff-btn-submit');
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!submitted) throw new Error('Form submit button not found');

  const deadline = Date.now() + timeoutMs;
  let success = false;
  let bodyText = '';
  while (Date.now() < deadline) {
    bodyText = String(await page.evaluate('document.body.innerText') || '');
    success = bodyText.toLowerCase().includes(String(successText).toLowerCase());
    if (success) break;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  if (settleMs && success) await new Promise(resolve => setTimeout(resolve, settleMs));

  const formId = Number(await page.evaluate(`(() => {
    const form = document.querySelector('form[id^="fluentform_"]');
    return form ? Number(form.id.replace('fluentform_', '')) : 0;
  })()`));

  return {success, bodyText, formId, submitted: true, timeoutMs};
}

/**
 * Full contract: HTML shortcode rendered, browser form submitted,
 * and Fluent Forms entry count incremented through WP-CLI.
 */
export async function verifyRfqForm({
  base,
  route = '/contact/',
  fields = defaultRfqFields(),
  formId = 0,
  browserPage,
  wp,
  successText = 'Thank you',
  timeoutMs = 25000,
  countTimeoutMs = 20000,
  fetchImpl = fetch,
} = {}) {
  if (typeof wp !== 'function') throw new Error('A WP-CLI runner is required for form verification');
  const {fetchPage} = await import('./verify.mjs');
  const fetched = await fetchPage(base, route, {fetchImpl});
  const inspection = inspectFormHtml(fetched.html, route);
  if (!inspection.pass) {
    return {
      pass: false,
      route,
      inspection,
      reason: inspection.shortcodePresent
        ? 'RFQ shortcode was not rendered into a Fluent Forms form'
        : 'No Fluent Forms form was found on the RFQ route',
    };
  }

  const resolvedFormId = Number(formId || inspection.formId);
  if (!resolvedFormId) throw new Error('Unable to determine Fluent Forms form ID');
  const countPhp = `global $wpdb; $form_id = ${Number(resolvedFormId)}; $table = $wpdb->prefix . 'fluentform_submissions'; echo (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE form_id = %d", $form_id));`;
  const readCount = () => Number(String(wp(['eval', countPhp])).trim().split('\n').pop()) || 0;

  const before = readCount();
  const submission = await submitFormInPage(browserPage, {base, route, fields, successText, timeoutMs});

  const deadline = Date.now() + countTimeoutMs;
  let entry = null;
  let after;
  do {
    await new Promise(resolve => setTimeout(resolve, 500));
    after = readCount();
    if (after > before) {
      const entryPhp = `global $wpdb; $form_id = ${Number(resolvedFormId)}; $table = $wpdb->prefix . 'fluentform_submissions'; $id = (int) $wpdb->get_var($wpdb->prepare("SELECT MAX(id) FROM {$table} WHERE form_id = %d", $form_id)); $row = $wpdb->get_row($wpdb->prepare("SELECT id, form_id, status, created_at FROM {$table} WHERE id = %d", $id), ARRAY_A); echo wp_json_encode($row);`;
      entry = JSON.parse(String(wp(['eval', entryPhp])).trim().split('\n').pop());
      break;
    }
  } while (Date.now() < deadline);

  const dbIncremented = after > before;
  return {
    pass: inspection.pass && submission.success && dbIncremented,
    route,
    formId: resolvedFormId,
    inspection,
    before,
    after,
    increment: after - before,
    entry,
    submitted: submission.submitted,
    success: submission.success,
    fields: Object.keys(fields),
  };
}
