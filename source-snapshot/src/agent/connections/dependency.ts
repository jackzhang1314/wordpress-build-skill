import { t } from '../../i18n/runtime';
import { bindText } from '../../i18n/dom';
import { connectors, connectionLabel, openConnector, type ConnectorId } from './catalog';
import { decorateButton } from '../../design/system';

/** A dependency links to settings; skill surfaces never own credential inputs. */
export function connectorDependency(id: ConnectorId, navigate?: () => void): HTMLElement {
  const connector = connectors.find(item => item.id === id)!;
  const root = document.createElement('section'); root.className = 'skill-overview-section';
  const title = document.createElement('h4'); bindText(title, () => (t('uiRequiredConnector')));
  const state = document.createElement('p'); bindText(state, () => (t('uiValue1Loading', { value1: connector.title }))); state.setAttribute('role', 'status');
  const button = decorateButton(document.createElement('button')); button.type = 'button'; bindText(button, () => (t('uiSetUpConnector')));
  const refresh = () => { void connector.status().then(status => { state.textContent = `${connector.title} · ${connectionLabel(status)}`; }).catch(() => { bindText(state, () => (t('uiValue1CouldNotLoadConnectionStatus', { value1: connector.title }))); }); };
  button.onclick = () => { if (navigate) navigate(); else openConnector(id, () => { refresh(); button.focus(); }); };
  root.append(title, state, button); refresh(); return root;
}
