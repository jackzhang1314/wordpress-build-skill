import { t } from '../../i18n/runtime';
import { bindText, readText, type TextValue } from '../../i18n/dom';
import { seoServiceConfiguration, seoMonitorOverview } from './seo-service-view';
import { dataForSeoConfiguration } from './dataforseo-view';
import { decorateButton } from '../../design/system';
import { agentRPC } from '../model';
import { skillInfoSchema } from '../skills/model';
import { productFor } from '../skills/catalog';
import { z } from 'zod';
import { connectors, connectionLabel, type ConnectorId } from './catalog';
import { apifyConfiguration } from './view';
import styles from './settings.css';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text: TextValue = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); bindText(node, () => (readText(text))); return node;
}
export class ConnectorSettings {
  readonly root = el('section');
  private content = el('div');
  private page: 'list' | 'detail' | 'auth' = 'list';
  private selected: ConnectorId = 'apify';
  constructor(private title: (title: string) => void) {
    this.root.className = 'connector-settings'; this.root.hidden = true;
    this.root.append(el('style', styles), this.content);
  }
  private button(text: TextValue, action: () => void): HTMLButtonElement {
    const button = decorateButton(el('button', text)); button.type = 'button'; button.onclick = action; return button;
  }
  open(id?: ConnectorId): void { if (id) this.detail(id); else this.list(); }
  canLeave(): boolean {
    if (this.root.querySelector('[data-busy="true"]')) return false;
    return !this.root.querySelector('[data-dirty="true"]') || window.confirm(t('uiYouHaveUnsavedConnectionSettingsGoBack'));
  }
  back(): boolean {
    if (this.page === 'list') return false;
    if (!this.canLeave()) return true;
    if (this.page === 'auth') this.detail(this.selected); else this.list();
    return true;
  }
  private list(): void {
    this.page = 'list'; this.title(t('connectors'));
    this.content.replaceChildren(el('p', () => (t('uiConnectAnExternalServiceOnceToUse'))));
    for (const connector of connectors) {
      const row = this.button('', () => this.detail(connector.id)); row.classList.add('connector-row');
      const copy = el('span'), status = el('span', () => (t('uiLoading'))); status.className = 'connector-status';
      copy.append(el('strong', connector.title), el('small', connector.description)); row.append(copy, status);
      void connector.status().then(value => { status.textContent = connectionLabel(value); }).catch(() => { bindText(status, () => (t('uiCouldNotLoad'))); });
      this.content.append(row);
    }
  }
  private detail(id: ConnectorId): void {
    this.page = 'detail'; this.selected = id;
    const connector = connectors.find(item => item.id === id)!; this.title(connector.title);
    const status = el('p', () => (t('uiLoadingAccountStatus'))); status.setAttribute('role', 'status');
    const configure = this.button(() => (t('uiSetUpConnection')), () => this.authorize());
    this.content.replaceChildren(el('p', connector.description), el('h3', () => (t('uiAccountConnection'))), status, configure,
      el('h3', () => (t('uiAvailableCapabilities'))), el('p', connector.capabilities), el('h3', () => (t('uiRelatedSkills'))));
    const skills = el('p', () => (t('uiLoadingRelatedSkills'))); this.content.append(skills);
    if (id === 'dataforseo') this.content.append(seoMonitorOverview());
    void connector.status().then(value => {
      bindText(status, () => (value.configured ? t('uiDefaultAccountValue1', { value1: connectionLabel(value) }) : t('uiNoValue1AccountConnected', { value1: connector.title })));
      bindText(configure, () => (value.configured ? t('uiManageConnection') : t('uiConnectValue1', { value1: connector.title })));
    }).catch(() => { bindText(status, () => (t('uiCouldNotLoadAccountStatusOpenConnection'))); });
    void agentRPC({ type: 'agent:skills-list' }).then(data => {
      const related = z.array(skillInfoSchema).parse(data).filter(skill => productFor(skill).connections?.includes(id) || (id === 'apify' && skill.name === 'apify-google-maps-leads'));
      bindText(skills, () => (related.length ? related.map(skill => productFor(skill).title + (skill.enabled ? '' : t('uiDisabled'))).join('、') : t('uiNoSkillsCurrentlyUseThisConnector')));
    }).catch(() => { bindText(skills, () => (t('uiCouldNotLoadRelatedSkills'))); });
  }
  private authorize(): void {
    this.page = 'auth';
    this.title(t('uiValue1ConnectionSettings', { value1: connectors.find(item => item.id === this.selected)!.title }));
    this.content.replaceChildren(this.selected === 'google' || this.selected === 'wordpress' ? seoServiceConfiguration(this.selected) : this.selected === 'dataforseo' ? dataForSeoConfiguration() : apifyConfiguration());
    this.content.querySelector<HTMLInputElement>('input')?.focus();
  }
}
