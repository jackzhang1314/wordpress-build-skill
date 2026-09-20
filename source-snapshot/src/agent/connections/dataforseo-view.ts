import { showFailure } from '../../lib/settings-guidance-view';
import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import { decorateButton } from '../../design/system';
import { dataForSeoStatus, saveDataForSeo, removeDataForSeo, testDataForSeo } from './dataforseo';
import styles from './view.css';
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text: TextValue = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); bindText(element, () => (readText(text))); return element;
}
/** Credentials stay outside skill metadata and downloadable packages. */
export function dataForSeoConfiguration(): HTMLElement {
  const root = el('section'), heading = el('h3', () => (t('uiDefaultAccount'))), content = el('div');
  root.className = 'skill-api-config'; const style = el('style', styles); root.append(style, heading, content);
  const loginLabel = el('label', 'API Login'), login = el('input'); login.type = 'text'; login.autocomplete = 'off'; login.spellcheck = false; login.setAttribute('aria-label', 'DataForSEO API Login'); login.placeholder = 'DataForSEO API Login'; loginLabel.append(login);
  const label = el('label', 'API Password'), input = el('input'); input.type = 'password'; input.autocomplete = 'off'; input.spellcheck = false;
  bindAttribute(input, 'placeholder', () => (t('uiPasteYourDataForSEOAPIPassword'))); input.setAttribute('aria-label', 'DataForSEO API Password'); label.append(input);
  const help = el('a', () => (t('uiGetAPICredentialsFromDataForSEO'))); help.href = 'https://app.dataforseo.com/api-access'; help.target = '_blank'; help.rel = 'noopener noreferrer';
  const state = el('p', () => (t('uiLoadingSettings'))); state.setAttribute('role', 'status'); state.setAttribute('aria-live', 'polite');
  const actions = el('div'); actions.className = 'skill-api-actions';
  const save = el('button', () => (t('uiSaveConfiguration'))), test = el('button', () => (t('uiTestConnection'))), remove = el('button', () => (t('uiRemoveConfiguration')));
  const buttons = [save, test, remove]; let configured = false, busy = true;
  const update = () => { root.dataset.busy = String(busy); root.dataset.dirty = String(!!(input.value || login.value)); save.disabled = busy || (!input.value || !login.value.trim()); test.disabled = busy || !configured || !!(input.value || login.value); remove.disabled = busy || !configured; input.disabled = busy; login.disabled = busy; };
  for (const button of buttons) { button.type = 'button'; decorateButton(button, button === save ? 'primary' : 'secondary'); }
  const perform = async (action: () => Promise<string>) => {
    if (busy) return; busy = true; bindText(state, () => (t('uiWorking2'))); update();
    try { state.textContent = await action(); } catch (error) { showFailure(state, error); }
    finally { busy = false; update(); }
  };
  input.addEventListener('input', update); login.addEventListener('input', update);
  save.onclick = () => { void perform(async () => { await saveDataForSeo(login.value, input.value); input.value = ''; login.value = ''; configured = true; return t('uiConfigurationSavedConnectionHasNotBeenTested'); }); };
  test.onclick = () => { void perform(async () => { await testDataForSeo(); return t('uiConnectionVerifiedThisTestOnlyReadsAccount'); }); };
  remove.onclick = () => { void perform(async () => { await removeDataForSeo(); configured = false; input.value = ''; login.value = ''; return t('uiConfigurationRemoved'); }); };
  actions.append(...buttons);
  content.append(el('p', () => (t('uiOneDataForSEOAccountIsSharedAcrossSEO'))), loginLabel, label, help, actions, state,
    el('p', () => (t('uiSEOQueriesAreChargedToYourDataForSEO'))));
  update();
  void dataForSeoStatus().then(status => { configured = status.configured; bindText(state, () => (status.configured ? status.checkedAt ? t('uiConfiguredLastVerifiedValue1', { value1: new Date(status.checkedAt).toLocaleString() }) : t('uiConfiguredNotVerified') : t('uiNotConfigured'))); }).catch(() => { bindText(state, () => (t('uiCouldNotLoadSettingsReopenThisPage'))); }).finally(() => { busy = false; update(); });
  return root;
}
