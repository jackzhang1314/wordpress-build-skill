import { showFailure } from '../../lib/settings-guidance-view';
import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import { decorateButton } from '../../design/system';
import { apifyStatus, saveApifyToken, removeApifyToken, testApifyConnection } from './apify';
import styles from './view.css';
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text: TextValue = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); bindText(element, () => (readText(text))); return element;
}
/** Credentials stay outside skill metadata and downloadable packages. */
export function apifyConfiguration(): HTMLElement {
  const root = el('section'), heading = el('h3', () => (t('uiDefaultAccount'))), content = el('div');
  root.className = 'skill-api-config'; const style = el('style', styles); root.append(style, heading, content);
  const label = el('label', 'API Token'), input = el('input'); input.type = 'password'; input.autocomplete = 'off'; input.spellcheck = false;
  bindAttribute(input, 'placeholder', () => (t('uiPasteYourApifyAPIToken'))); input.setAttribute('aria-label', 'Apify API Token'); label.append(input);
  const help = el('a', () => (t('uiGetATokenFromApify'))); help.href = 'https://console.apify.com/settings/integrations'; help.target = '_blank'; help.rel = 'noopener noreferrer';
  const state = el('p', () => (t('uiLoadingSettings'))); state.setAttribute('role', 'status'); state.setAttribute('aria-live', 'polite');
  const actions = el('div'); actions.className = 'skill-api-actions';
  const save = el('button', () => (t('uiSaveConfiguration'))), test = el('button', () => (t('uiTestConnection'))), remove = el('button', () => (t('uiRemoveConfiguration')));
  const buttons = [save, test, remove]; let configured = false, busy = true;
  const update = () => { root.dataset.busy = String(busy); root.dataset.dirty = String(!!input.value); save.disabled = busy || !input.value.trim(); test.disabled = busy || !configured || !!input.value; remove.disabled = busy || !configured; input.disabled = busy; };
  for (const button of buttons) { button.type = 'button'; decorateButton(button, button === save ? 'primary' : 'secondary'); }
  const perform = async (action: () => Promise<string>) => {
    if (busy) return; busy = true; bindText(state, () => (t('uiWorking2'))); update();
    try { state.textContent = await action(); } catch (error) { showFailure(state, error); }
    finally { busy = false; update(); }
  };
  input.addEventListener('input', update);
  save.onclick = () => { void perform(async () => { await saveApifyToken(input.value); input.value = ''; configured = true; return t('uiConfigurationSavedConnectionHasNotBeenTested'); }); };
  test.onclick = () => { void perform(async () => { await testApifyConnection(); return t('uiConnectionVerifiedNoScrapingTaskWasStarted'); }); };
  remove.onclick = () => { void perform(async () => { await removeApifyToken(); configured = false; input.value = ''; return t('uiConfigurationRemoved'); }); };
  actions.append(...buttons);
  content.append(el('p', () => (t('uiOneApifyConnectionCanBeUsedAcross'))), label, help, actions, state,
    el('p', () => (t('uiScrapingCostsAreChargedToYourApify'))));
  update();
  void apifyStatus().then(status => { configured = status.configured; bindText(state, () => (status.configured ? status.checkedAt ? t('uiConfiguredLastVerifiedValue1', { value1: new Date(status.checkedAt).toLocaleString() }) : t('uiConfiguredNotVerified') : t('uiNotConfigured'))); }).catch(() => { bindText(state, () => (t('uiCouldNotLoadSettingsReopenThisPage'))); }).finally(() => { busy = false; update(); });
  return root;
}
