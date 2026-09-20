import { showFailure } from '../../lib/settings-guidance-view';
import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import { skillComposer } from './composer';
import browseStyles from './manage.css';
import { bindDisclosureKeyboard } from '../../lib/disclosure-keyboard';
import { skillDetailContent } from './detail-content';
import { settingsIcon } from '../../quick/settings-icons';
import { z } from 'zod';
import { agentRPC } from '../model';
import { parseSkill, readSkillUpload } from './import';
import { discoverGitHubSkills, downloadGitHubSkill, GITHUB_ORIGIN, parseGitHubLink, type GitHubDiscovery } from './github';
import { skillInfoSchema, skillPackageSchema, type SkillInfo, type SkillPackage } from './model';
import { titleFor } from './presentation';
import { categories, matchesSkill, productFor, type SkillCategory } from './catalog';
import { exportSkillPackage } from './package';
function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: TextValue): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag); el.className = className; if (text) bindText(el, () => (readText(text))); return el;
}
export class SkillsView {
  readonly element = node('section', 'agent-settings skill-dialog');
  private dialog = this.element;
  private list = node('div', 'skill-list');
  private preview = node('section', 'skill-preview');
  private status = node('p', 'skill-status');
  private filter = node('input', 'skill-search');
  private category = node('div', 'skill-category-tabs');
  private selectedCategory: 'all' | SkillCategory = 'all';
  private categoryTabs = new Map<'all' | SkillCategory, HTMLButtonElement>();
  private seoFilters = node('div', 'skill-category-tabs');
  private seoGroup = 'all';
  private results = node('p', 'skill-result-count');
  private catalog: SkillInfo[] = [];
  private busy = false;
  private running = false;
  private picking = false;
  private previewSkill?: SkillPackage;
  private pendingImport = false;
  private files = node('input', '');
  private folder = node('input', '');
  private library = node('section', 'skill-library');
  private github = node('section', 'skill-github');
  private githubInput = node('input', 'skill-search');
  private githubResults = node('div', 'skill-github-results');
  private download?: AbortController;
  private cancelDownload = this.button(() => (t('uiCancelDownload')), () => this.download?.abort());
  private imports = node('details', 'skill-import-menu');
  constructor(private prompt: HTMLTextAreaElement, private onClose: () => boolean | void = () => undefined) {
    this.dialog.hidden = true; this.dialog.id = 'agent-skills'; bindAttribute(this.dialog, 'aria-label', () => t('skills'));
    const heading = node('div', 'settings-heading'), title = node('h2', '', () => (t('skills'))); title.id = 'skill-heading';
    const close = this.button('×', () => this.close()); close.className = 'agent-icon'; bindAttribute(close, 'aria-label', () => t('uiCloseSkills')); close.dataset.cancel = 'true';
    heading.append(title, close);
    const intro = node('p', 'settings-intro', () => (t('uiWhenEnabledAIUsesRelevantSkillsAutomatically')));
    const style = node('style', ''); style.textContent = browseStyles; this.dialog.append(style);
    const actions = node('div', 'skill-import-actions');
    this.files.type = this.folder.type = 'file'; this.files.accept = '.md,.zip'; this.files.hidden = this.folder.hidden = true;
    bindAttribute(this.files, 'aria-label', () => t('uiImportSkillFile')); bindAttribute(this.folder, 'aria-label', () => t('uiImportSkillFolder')); this.folder.webkitdirectory = true; this.folder.multiple = true;
    actions.append(this.button(() => (t('uiImportFromGitHub')), () => this.openGitHub(), true), this.button(() => (t('uiUploadFileZIP')), () => this.files.click(), true), this.button(() => (t('uiImportFolder')), () => this.folder.click(), true));
    this.filter.type = 'search'; bindAttribute(this.filter, 'placeholder', () => (t('uiSearchSkills'))); bindAttribute(this.filter, 'aria-label', () => t('uiSearchSkills')); this.filter.addEventListener('input', () => { this.renderList(); this.list.scrollTop = 0; });
    const imports = this.imports, importSummary = node('summary','', () => (t('uiImportSkills'))); importSummary.append(settingsIcon('chevron'));
    const importPanel = node('div', 'skill-import-panel'); importPanel.setAttribute('role', 'group'); bindAttribute(importPanel, 'aria-label', () => t('uiChooseAnImportMethod'));
    importPanel.append(actions,node('p','skill-format',() => (t('uiSupportsMarkdownZIPOrFoldersEachPackage')))); imports.append(importSummary,importPanel);
    const dismissOutside = (event: PointerEvent) => { if (event.target instanceof Node && !imports.contains(event.target)) imports.open = false; };
    imports.addEventListener('toggle', () => { document.removeEventListener('pointerdown', dismissOutside); if (imports.open) document.addEventListener('pointerdown', dismissOutside); });
    bindDisclosureKeyboard(imports);
    imports.addEventListener('focusout', event => { if (event.relatedTarget instanceof Node && !imports.contains(event.relatedTarget)) imports.open = false; });
    actions.addEventListener('click', () => { imports.open = false; });
    bindAttribute(this.category, 'aria-label', () => t('uiManageSkillsByCategory')); this.category.setAttribute('role', 'tablist');
    this.list.id = `skill-list-${crypto.randomUUID()}`; this.list.setAttribute('role','tabpanel');
    const labels: Record<SkillCategory,() => string> = {prospecting:() => t('uiProspecting'),communication:() => t('uiCommunication'),website:() => t('uiWebsite'),seo:() => 'SEO',social:() => t('uiSocialMedia'),advertising:() => t('uiAdvertising'),data:() => t('uiData'),custom:() => t('uiImported')};
    for (const category of [{id:'all',get title() { return t('uiAllCategories'); }} as const, ...categories]) {
      const tab = this.button(() => (category.id === 'all' ? t('uiAllCategories') : labels[category.id]()), () => this.selectCategory(category.id));
      tab.className = 'skill-category-tab'; tab.id = `${this.list.id}-${category.id}`;
      bindAttribute(tab, 'title', () => category.title); bindAttribute(tab, 'aria-label', () => category.title); tab.setAttribute('role','tab'); tab.setAttribute('aria-controls',this.list.id);
      tab.addEventListener('keydown', event => {
        const ids = [...this.categoryTabs.keys()], index = ids.indexOf(category.id);
        const next = event.key === 'ArrowRight' ? ids[(index + 1) % ids.length] : event.key === 'ArrowLeft' ? ids[(index + ids.length - 1) % ids.length] : event.key === 'Home' ? ids[0] : event.key === 'End' ? ids.at(-1) : undefined;
        if (!next) return; event.preventDefault(); this.selectCategory(next); this.categoryTabs.get(next)?.focus();
      });
      this.categoryTabs.set(category.id,tab); this.category.append(tab);
    }
    bindAttribute(this.seoFilters, 'aria-label', () => t('uiSEOCategories'));
    for (const [group, label] of [['all', 'uiAllSEO'], ['竞争分析', 'uiCompetitorAnalysis'], ['内容生产', 'uiContentCreation'], ['关键词', 'uiKeywords'], ['外链', 'uiBacklinks'], ['页面优化', 'uiOnpageSEO'], ['技术审计', 'uiTechnicalAudits']] as const) {
      const button=this.button(() => t(label),()=>{this.seoGroup=group;this.renderList();this.list.scrollTop=0;});
      button.dataset.group=group;button.className='skill-category-tab';button.setAttribute('aria-pressed','false');this.seoFilters.append(button);
    }
    this.seoFilters.hidden=true;
    this.results.setAttribute('role','status'); this.results.setAttribute('aria-live','polite');
    const toolbar = node('div','skill-toolbar'); toolbar.append(this.filter,imports); this.library.append(intro,toolbar,this.category,this.seoFilters,this.results,this.list);
    this.preview.hidden = true; this.status.setAttribute('role', 'status'); this.status.setAttribute('aria-live', 'polite');
    this.github.hidden = true;
    this.cancelDownload.dataset.cancel = 'true'; this.cancelDownload.hidden = true;
    this.dialog.append(heading, this.library, this.github, this.preview, this.status, this.cancelDownload, this.files, this.folder); document.body.append(this.dialog);
    for (const input of [this.files, this.folder]) input.addEventListener('change', () => {
      const selected = Array.from(input.files ?? []); input.value = ''; if (!selected.length) return;
      void this.perform(async () => { this.previewSkill = await parseSkill(await readSkillUpload(selected)); this.pendingImport = true; this.renderPreview(); });
    });
  }
  private button(label: TextValue, action: () => void, mutation = false): HTMLButtonElement {
    const button = node('button', '', label); button.type = 'button'; if (mutation) button.dataset.mutation = 'true';
    button.addEventListener('click', action); return button;
  }
  private async perform(action: () => Promise<void>): Promise<void> {
    if (this.busy) return; this.busy = true; this.status.textContent = ''; this.syncButtons();
    try { await action(); } catch (error) { bindText(this.status, () => (this.download?.signal.aborted ? t('uiDownloadCanceled') : error instanceof Error ? error.message : t('uiTheSkillActionFailedTryAgain'))); }
    finally { this.busy = false; this.download = undefined; this.syncButtons(); }
  }
  private syncButtons(): void {
    for (const button of this.dialog.querySelectorAll('button')) button.disabled = (this.busy && button.dataset.cancel !== 'true') || (this.running && button.dataset.mutation === 'true') || button.dataset.unavailable === 'true';
    this.cancelDownload.hidden = !this.busy || !this.download; this.githubInput.disabled = this.busy;
  }
  update(running: boolean): void {
    this.running = running; this.syncButtons();
    if (!this.dialog.hidden && running) bindText(this.status, () => (t('uiATaskIsRunningYouCanSelect')));
  }
  async open(mode: 'manage' | 'pick' = 'pick'): Promise<void> {
    this.picking = mode === 'pick';
    this.imports.open = false;
    this.preview.hidden = this.github.hidden = true; this.library.hidden = false; this.filter.value = ''; this.selectedCategory = 'all'; this.status.textContent = '';
    this.dialog.hidden = false;
    await this.perform(async () => { await this.reload(); if (this.running) bindText(this.status, () => (t('uiTheSkillLibraryCannotBeEditedDuring'))); });
  }
  private async reload(): Promise<void> { this.catalog = z.array(skillInfoSchema).parse(await agentRPC({ type: 'agent:skills-list' })); skillComposer(this.prompt).registerCatalog(this.catalog); this.renderList(); }
  private updateTitle(title: string): void { this.element.dispatchEvent(new CustomEvent('skills:title', { detail: title })); }
  private openGitHub(): void {
    this.updateTitle(t('uiImportFromGitHub'));
    this.library.hidden = this.preview.hidden = true; this.github.hidden = false; this.status.textContent = '';
    this.githubInput.type = 'text'; this.githubInput.placeholder = 'https://github.com/…'; bindAttribute(this.githubInput, 'aria-label', () => t('uiGitHubSkillLink'));
    this.githubResults.replaceChildren();
    const form = node('form', 'skill-github-form');
    const submit = this.button(() => (t('uiFindSkills')), () => {}, true); submit.type = 'submit'; form.append(this.githubInput, submit);
    form.addEventListener('submit', event => {
      event.preventDefault(); if (this.busy || this.running) return;
      try { parseGitHubLink(this.githubInput.value); } catch (error) { showFailure(this.status, error); return; }
      // Request optional host access directly in the user's submit gesture.
      const value = this.githubInput.value, permission = chrome.permissions.request({ origins: [GITHUB_ORIGIN] });
      this.download = new AbortController(); const signal = this.download.signal;
      void this.perform(async () => {
        this.githubResults.replaceChildren();
        if (!await permission) throw new Error(t('uiAllowAccessToGitHubToDownloadSkills'));
        signal.throwIfAborted(); bindText(this.status, () => (t('uiFindingSkillsInTheRepository')));
        const discovery = await discoverGitHubSkills(value, signal); signal.throwIfAborted();
        bindText(this.status, () => (t('uiFoundValue1SkillsChooseOneToPreview', { value1: discovery.candidates.length })));
        this.renderGitHubResults(discovery);
      });
    });
    this.github.replaceChildren(this.button(() => (t('uiBackToSkills')), () => { this.back(); }),
      node('h3', '', () => (t('uiImportFromGitHub'))), node('p', 'skill-description', () => (t('uiPasteAPublicRepositorySkillFolderOr'))), form,
      node('p', 'skill-format', () => (t('uiBranchesTagsAndCommitsAreSupportedOnly'))), this.githubResults);
    this.githubInput.focus(); this.syncButtons();
  }
  private renderGitHubResults(discovery: GitHubDiscovery): void {
    this.githubResults.replaceChildren();
    for (const candidate of discovery.candidates) {
      const row = node('article', 'skill-item');
      row.append(node('strong', '', candidate.path || discovery.repo), node('p', 'skill-format', () => (t('uiValue1FilesValue2value3', { value1: candidate.files.length, value2: discovery.owner, value3: discovery.repo }))),
        this.button(() => (t('uiPreviewSkill')), () => {
          this.download = new AbortController(); const signal = this.download.signal;
          void this.perform(async () => {
            bindText(this.status, () => (t('uiDownloadingTheSkillAndItsFiles')));
            const skill = await downloadGitHubSkill(discovery, candidate, signal); signal.throwIfAborted();
            this.previewSkill = skill; this.pendingImport = true; this.renderPreview(); this.status.textContent = '';
          });
        }, true));
      this.githubResults.append(row);
    }
  }
  back(): boolean {
    if (this.busy) return true;
    if (!this.preview.hidden) { this.preview.hidden = true; const fromGitHub = this.pendingImport && Boolean(this.previewSkill?.origin); this.github.hidden = !fromGitHub; this.library.hidden = fromGitHub; this.status.textContent = ''; this.updateTitle(fromGitHub ? t('uiImportFromGitHub') : this.picking ? t('uiChooseSkills') : t('skills')); return true; }
    if (!this.github.hidden) { this.github.hidden = true; this.library.hidden = false; this.status.textContent = ''; this.updateTitle(this.picking ? t('uiChooseSkills') : t('skills')); return true; }
    return false;
  }
  private close(): void { if (this.onClose() === false) return; this.download?.abort(); this.dialog.hidden = true; }
  private choose(info: SkillInfo): void {
    try { skillComposer(this.prompt).add(info); } catch (error) { showFailure(this.status, error); return; }
    this.close(); skillComposer(this.prompt).focus();
  }
  private selectCategory(value: 'all' | SkillCategory): void {
    this.selectedCategory = value; this.seoGroup='all'; this.renderList(); this.list.scrollTop = 0;
  }
  private renderList(): void {
    this.updateTitle(this.picking ? t('uiChooseSkills') : t('skills'));
    const scroll = this.list.scrollTop;
    this.seoFilters.hidden=this.selectedCategory!=='seo';
    for(const button of this.seoFilters.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.group===this.seoGroup));
    this.list.replaceChildren(); const query = this.filter.value.trim().toLowerCase();
    for (const [id,tab] of this.categoryTabs) { const selected = id === this.selectedCategory; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected) this.list.setAttribute('aria-labelledby',tab.id); }
    const matching = this.catalog.filter(info => (this.selectedCategory === 'all' || productFor(info).category === this.selectedCategory) && matchesSkill(info,query) && (this.selectedCategory!=='seo'||this.seoGroup==='all'||productFor(info).seoGroup===this.seoGroup));
    bindText(this.results, () => (t('uiValue1SkillsValue2Enabled', { value1: matching.length, value2: matching.filter(info => info.enabled).length })));
    for (const category of categories) {
      const items = matching.filter(info => productFor(info).category === category.id);
      if (!items.length) continue;
      for (const info of items) {
        const source = info.source, product = productFor(info);
        const row = node('article', 'skill-item'), header = node('div', 'skill-item-heading');
        const detail = this.button(() => product.title, () => { void this.perform(async () => { this.previewSkill = skillPackageSchema.parse(await agentRPC({ type: 'agent:skills-read', ref: info })); this.pendingImport = false; this.renderPreview(); }); }); detail.className = 'skill-title-button'; detail.title = info.name;
        const toggle = this.button('', () => { void this.perform(async () => { await agentRPC({ type: 'agent:skills-toggle', name: info.name, enabled: !info.enabled }); await this.reload(); bindText(this.status, () => (info.enabled ? t('uiSkillDisabled') : t('uiSkillEnabled'))); }); },true); toggle.className = 'setting-switch'; toggle.setAttribute('role','switch'); toggle.setAttribute('aria-checked',String(info.enabled)); bindAttribute(toggle, 'aria-label', () => t('uiEnableValue1', { value1: titleFor(info.name) })); header.append(detail,toggle);
        const actions = node('div', 'skill-item-actions');
        const use = this.button(() => (t('uiUse')), () => this.choose(info)); use.dataset.unavailable = String(!info.enabled);
        bindText(use, () => (t('uiUseInChat'))); if (this.picking) actions.append(use);
        if (source === 'imported') { const menu = node('details','skill-more'), summary = node('summary',''); bindAttribute(summary, 'aria-label', () => t('uiMoreSkillActions')); bindAttribute(summary, 'title', () => (t('more'))); summary.append(settingsIcon('dots')); menu.append(summary,this.button(() => (t('uiDeleteSkill')), () => { void this.perform(async () => { await agentRPC({ type: 'agent:skills-delete', name: info.name }); await this.reload(); bindText(this.status, () => (t('uiSkillRemovedPreviousTasksKeepTheirOriginal'))); }); },true)); bindDisclosureKeyboard(menu); actions.append(menu); }
        row.append(header, node('p', 'skill-description skill-description-clamped', () => product.summary), node('p','skill-format',() => (`${category.title} · ${source === 'builtin' ? t('uiBuiltin') : t('uiImportedCheckDependencies')}`)));
        if (info.diagnostics.length) row.append(node('p', 'skill-diagnostic', info.diagnostics.join(' ')));
        if (actions.childElementCount) row.append(actions); this.list.append(row);
      }
    }
    if (!this.list.childNodes.length) {
      const empty = node('div','skill-empty'); empty.append(node('p', '', () => (this.catalog.length ? t('uiNoMatchingSkills') : t('uiNoSkillsAddedYet'))), node('p','skill-format', () => (this.catalog.length ? t('uiTryAnotherCategoryOrSearchTerm') : t('uiImportSkillsFromGitHubFilesOrFolders'))));
      if (query || this.selectedCategory !== 'all') empty.append(this.button(() => (t('uiClearFilters')), () => { this.filter.value = ''; this.selectCategory('all'); this.filter.focus(); }));
      this.list.append(empty);
    }
    this.list.scrollTop = scroll; this.syncButtons();
  }
  private renderPreview(): void {
    const skill = this.previewSkill; if (!skill) return; this.updateTitle(this.pendingImport ? t('uiPreviewImportedSkill') : titleFor(skill.name));
    this.preview.replaceChildren(); this.preview.hidden = false; this.library.hidden = this.github.hidden = true;
    const fromGitHub = this.pendingImport && Boolean(skill.origin);
    const back = this.button(() => (fromGitHub ? t('uiBackToResults') : t('uiBackToSkills')), () => { this.back(); });
    const product = productFor(skill);
    back.className = 'skill-inner-back';
    const summary = node('div', 'skill-detail-summary');
    const category = categories.find(category => category.id === product.category)?.title ?? '';
    summary.append(node('p', 'skill-detail-meta', () => (`${category} · ${skill.source === 'builtin' ? t('uiBuiltinSkill') : t('uiImported2')}`)), node('p', 'skill-detail-description', () => product.summary));
    if (skill.diagnostics.length) summary.append(node('p', 'skill-diagnostic', skill.diagnostics.join('\n')));
    const footer = node('div', 'skill-detail-footer');
    this.preview.append(back, node('h3', '', () => product.title), summary, skillDetailContent(skill), footer);
    if (!this.pendingImport) {
      const state = node('div', 'skill-detail-state'), stateText = node('span', '', () => (skill.enabled ? t('uiEnabled') : t('qsDisabled')));
      const toggle = this.button('', () => { void this.perform(async () => {
        const enabled = !skill.enabled;
        await agentRPC({ type: 'agent:skills-toggle', name: skill.name, enabled });
        skill.enabled = enabled;
        const info = this.catalog.find(info => info.name === skill.name); if (info) info.enabled = enabled;
        this.renderList(); this.updateTitle(product.title);
        toggle.setAttribute('aria-checked', String(enabled)); bindText(stateText, () => (enabled ? t('uiEnabled') : t('qsDisabled')));
        if (use) use.dataset.unavailable = String(!enabled);
        bindText(this.status, () => (enabled ? t('uiSkillEnabled') : t('uiSkillDisabled')));
      }); }, true);
      toggle.className = 'setting-switch'; toggle.setAttribute('role', 'switch'); bindAttribute(toggle, 'aria-label', () => t('uiEnableValue1', { value1: product.title })); toggle.setAttribute('aria-checked', String(skill.enabled));
      const use = this.picking ? this.button(() => (t('uiUseInChat')), () => this.choose(skill)) : undefined;
      if (use) { use.dataset.unavailable = String(!skill.enabled); use.className = 'primary'; }
      state.append(toggle, stateText); footer.append(state); if (use) footer.append(use);
    } else {
      summary.append(node('p', 'skill-format', () => (t('uiImportingEnablesThisSkillForRelevantTasks'))));
    }
    if (!this.pendingImport) footer.append(this.button(() => (t('uiDownloadSkillPackage')), () => {
      const url = URL.createObjectURL(new Blob([exportSkillPackage(skill)], {type:'application/zip'}));
      const link = document.createElement('a'); link.href = url; link.download = `${skill.name}.zip`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }));
    if (this.pendingImport) {
      const existing = this.catalog.find(info => info.name === skill.name);
      const install = this.button(() => (existing ? t('uiUpdateSkill') : t('uiImportAndEnable')), () => { void this.perform(async () => {
        await agentRPC({ type: 'agent:skills-import', files: skill.files, replaceVersion: existing?.version, origin: skill.origin });
        await this.reload(); this.preview.hidden = true; this.library.hidden = false;
        bindText(this.status, () => (existing ? t('uiSkillUpdatedPausedAndQueuedTasksKeep') : t('uiSkillImportedAndEnabledForRelevantTasks')));
      }); }, true); install.className = 'primary'; footer.append(install);
    }
    this.syncButtons();
  }
}
