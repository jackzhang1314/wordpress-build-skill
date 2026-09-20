import { t } from '../../i18n/runtime';
import { googleStatus } from './google';
import { wordpressStatus } from './wordpress';
import { dataForSeoStatus } from './dataforseo';
export type { ConnectorId } from './ids';
import type { ConnectorId } from './ids';
import { apifyStatus, type ConnectionStatus } from './apify';

/** Service definitions are separate from the user's saved credentials. */
export const connectors = [{
  id: 'apify', title: 'Apify',
  get description() { return t('uiConnectAWebScrapingServiceForUse'); },
  status: apifyStatus,
  get capabilities() { return t('uiCollectMapBusinessListingsFindWebsiteContact'); },
}, {
  id: 'dataforseo', title: 'DataForSEO',
  get description() { return t('uiConnectSEODataForKeywordContentAnd'); },
  status: dataForSeoStatus,
  get capabilities() { return t('uiKeywordsSERPsCompetitorsContentGapsBacklinksPage'); },
}, {
  id: 'google', title: 'Google', get description() { return t('uiConnectSearchConsoleGmailAndCrUXFor'); }, status: googleStatus,
  get capabilities() { return t('uiAccessSearchDataAndIndexChecksFor'); },
}, {
  id: 'wordpress', title: 'WordPress', get description() { return t('uiConnectYourSiteToManageBlockPages'); }, status: wordpressStatus,
  get capabilities() { return t('uiUseAnApplicationPasswordToManagePosts'); },
}] as const;
export function connectionLabel(status: ConnectionStatus): string {
  return !status.configured ? t('uiNotConnected') : status.checkedAt ? t('uiVerified') : t('uiConfiguredVerificationNeeded');
}
export const connectorNavigationEvent = 'agent:open-connector';
export function openConnector(id: ConnectorId, returnTo?: () => void): void {
  window.dispatchEvent(new CustomEvent(connectorNavigationEvent, { detail: { id, returnTo } }));
}
