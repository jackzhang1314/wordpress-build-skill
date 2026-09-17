import {readWordpressSite} from './wordpress-site';
import { showFailure } from '../../lib/settings-guidance-view';
import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import {discoverWordpress} from './wordpress-workflows';
import {decorateButton} from '../../design/system';
import {authorizeGoogle,googleStatus,saveGoogle,removeGoogle,testGoogle} from './google';
import {wordpressStatus,saveWordpress,removeWordpress,testWordpress} from './wordpress';
import styles from './view.css';
function el<K extends keyof HTMLElementTagNameMap>(tag:K,text:TextValue=''){const node=document.createElement(tag);bindText(node, () => (readText(text)));return node;}
export function seoServiceConfiguration(service:'google'|'wordpress'):HTMLElement{
 const root=el('section');root.className='skill-api-config';root.append(el('style',styles),el('h3',() => (service==='google'?t('uiGoogleAuthorization'):t('uiWordPressSite'))));
 if(service==='wordpress'){
  root.append(el('h4',()=>t('uiWordPressSiteComponents')),el('p',()=>t('uiWordPressInstallComponents')));
  const downloads=el('div');downloads.className='skill-api-actions';
  for(const [name,label]of [['octopus-site','uiWordPressDownloadPlugin']] as const){const a=el('a',()=>t(label));const path=`wordpress-site/${name}-0.1.0.zip`;a.href=typeof chrome!=='undefined'&&chrome.runtime?.id?chrome.runtime.getURL(path):`/${path}`;a.download=`${name}-0.1.0.zip`;downloads.append(a);}
  root.append(downloads);
 }
 const fields:HTMLInputElement[]=[];
 const field=(label:TextValue,type='text')=>{const row=el('label',label),input=el('input');input.type=type;input.autocomplete='off';input.spellcheck=false;bindAttribute(input, 'aria-label', () => readText(label));row.append(input);root.append(row);fields.push(input);return input;};
 root.append(el('p',() => (service==='google'?t('uiUseAWebOAuthClientIDFrom'):t('uiEnterYourSitesHTTPSURLUsernameAnd'))));
 const first=field(service==='google'?'Google OAuth Client ID':t('uiWordPressSiteURL'));
 const second=field(service==='google'?t('uiCrUXAPIKeyOptional'):t('uiWordPressUsername'),service==='google'?'password':'text');
 const third=service==='wordpress'?field(t('uiWordPressApplicationPassword'),'password'):undefined;
 if(service==='google'){
  const redirect=typeof chrome!=='undefined'&&chrome.identity?.getRedirectURL?chrome.identity.getRedirectURL('google'):t('uiOpenTheInstalledExtensionToSeeThe');root.append(el('p',() => (t('uiAddThisAuthorizedRedirectURIInGoogle', { value1: redirect }))));
 }
 const state=el('p',() => (t('uiLoadingConfiguration')));state.setAttribute('role','status');state.setAttribute('aria-live','polite');const actions=el('div');actions.className='skill-api-actions';
 const buttons:HTMLButtonElement[]=[];let busy=true,configured=false;
 const update=()=>{root.dataset.busy=String(busy);root.dataset.dirty=String(fields.some(f=>!!f.value));fields.forEach(f=>{f.disabled=busy;});buttons.forEach(b=>{b.disabled=busy||(b.dataset.action==='save'?(service==='google'?!first.value.trim()&&!second.value.trim():!first.value.trim()||!second.value.trim()||!third?.value):!configured||fields.some(f=>!!f.value));});};
 const perform=async(action:()=>Promise<string>)=>{if(busy)return;busy=true;update();try{state.textContent=await action();}catch(error){showFailure(state, error);}finally{busy=false;update();}};
 const button=(label:TextValue,kind:string,action:()=>Promise<string>)=>{const b=decorateButton(el('button',label),kind==='save'?'primary':'secondary');b.type='button';b.dataset.action=kind;b.onclick=()=>{void perform(action);};buttons.push(b);actions.append(b);};
 button(() => (t('uiSaveConfiguration')),'save',async()=>{if(service==='google')await saveGoogle(first.value,second.value);else await saveWordpress(first.value,second.value,third!.value);fields.forEach(f=>{f.value='';});configured=true;return service==='google'?t('uiConfigurationSavedChooseWhichGoogleServicesTo'):t('uiConfigurationSavedTestTheConnectionNext');});
 if(service==='google')for(const [mode,label] of [['search',t('uiAuthorizeSearchConsole')],['mail',t('uiAuthorizeGmail')],['both',t('uiAuthorizeBothServices')]] as const)button(label,'auth',async()=>{await authorizeGoogle(mode);return t('uiGoogleAuthorizedReturnHereToReauthorizeWhen');});
 button(() => (t('uiTestConnection')),'test',async()=>{await(service==='google'?testGoogle():testWordpress());return t('uiConnectionVerified');});
 if(service==='wordpress'){root.append(el('p',() => (t('uiEnableTheRESTAPIForACFContent'))));button(() => (t('uiCheckSiteCapabilities')),'capabilities',async()=>{const report=await discoverWordpress(new AbortController().signal);const names=Array.isArray(report.abilities)?report.abilities.flatMap((v:unknown)=>v&&typeof v==='object'&&'name' in v&&typeof v.name==='string'?[v.name]:[]):[];return `站点：${report.site}；内容类型：${report.types.map(t=>String(t.label??t.name)).join('、')}；插件能力：${names.join('、')||report.abilityStatus}。${report.abilityCoverage}。${report.note}`;});}
 if(service==='wordpress')button(()=>t('uiWordPressCheckComponents'),'site-components',async()=>{const report=await readWordpressSite(new AbortController().signal);return t('uiWordPressComponentsStatus',{version:report.version,theme:report.state.theme,acf:report.acfAvailable?t('uiWordPressAcfAvailable'):t('uiWordPressAcfMissing')});});
 button(() => (t('uiRemoveConfiguration')),'remove',async()=>{await(service==='google'?removeGoogle():removeWordpress());configured=false;return t('uiLocalConfigurationAndAuthorizationRemoved');});
 for(const f of fields)f.oninput=update;
 root.append(actions,state);update();void(service==='google'?googleStatus():wordpressStatus()).then(s=>{configured=s.configured;bindText(state, () => (s.checkedAt?t('uiVerified'):s.configured?t('uiConfiguredVerifyOrReauthorize'):t('uiNotConfigured')));}).catch(()=>{bindText(state, () => (t('uiCouldNotLoadReopenThisPageIn')));}).finally(()=>{busy=false;update();});return root;
}

/** Read-only overview plus explicit pause; no scheduled costs are enabled by opening settings. */
export function seoMonitorOverview():HTMLElement{
 const root=el('section');root.append(el('h3',() => (t('uiScheduledSEOMonitoring'))));const list=el('div'),refresh=decorateButton(el('button',() => (t('uiRefreshMonitorStatus'))));refresh.type='button';
 const render=async()=>{list.replaceChildren(el('p',() => (t('uiLoading'))));try{const {listSeoMonitors,pauseSeoMonitor}=await import('./seo-monitors');const items=await listSeoMonitors();list.replaceChildren();if(!items.length)list.append(el('p',() => (t('uiNoMonitorsYetAskAIToMonitor'))));
 for(const item of items){const row=el('div');row.append(el('strong',item.name),el('p',() => (`${({active:t('uiRunning'),paused:t('uiPaused'),complete:t('uiCompleted'),unknown:t('uiNeedsReview')} as const)[item.status]} · ${item.runs}/${item.maxRuns} 次 · 每 ${item.intervalMinutes} 分钟`)));if(item.error)row.append(el('p',item.error));if(item.status==='active'){const pause=decorateButton(el('button',() => (t('uiPauseMonitor'))));pause.type='button';pause.onclick=()=>{pause.disabled=true;void pauseSeoMonitor(item.id).then(render).catch(()=>{pause.disabled=false;row.append(el('p',() => (t('uiCouldNotPauseTryAgain'))));});};row.append(pause);}list.append(row);}
 }catch{list.replaceChildren(el('p',() => (t('uiCouldNotLoadMonitorsOpenThisPage'))));}};
 refresh.onclick=()=>{void render();};root.append(refresh,list);void render();return root;
}
