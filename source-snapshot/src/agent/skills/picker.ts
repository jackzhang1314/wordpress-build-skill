import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import { connectorDependency } from '../connections/dependency';
import { openConnector } from '../connections/catalog';
import { z } from 'zod';
import { skillComposer } from './composer';
import puzzle from '@tabler/icons/outline/puzzle.svg?raw';
import search from '@tabler/icons/outline/search.svg?raw';
import close from '@tabler/icons/outline/x.svg?raw';
import { updateFavoriteButton } from '../../lib/favorite-button';
import { agentRPC } from '../model';
import { ComposerDrawer } from '../composer-drawer';
import { element as el } from '../prompts/ui';
import { skillInfoSchema, type SkillInfo } from './model';
import { categories, matchesSkill, productFor } from './catalog';
import { loadSkillPreferences, saveSkillPreferences } from './preferences';

export class SkillsPicker {
  readonly root = el('dialog', 'skills-picker');
  private drawer = new ComposerDrawer(this.root);
  private list = el('div', 'sp-list');
  private status = el('p', 'sp-status');
  private search = el('input');
  private category = el('div', 'sp-category');
  private selectedCategory = 'all';
  private categoryTabs = new Map<string, HTMLButtonElement>();
  private content = el('div', 'sp-content');
  private detail = el('section', 'sp-detail');
  private prefs = loadSkillPreferences();
  private catalog: SkillInfo[] = [];
  private revision = 0;
  private opener?: HTMLElement;
  constructor(private prompt: HTMLTextAreaElement, manage: () => void) {
    bindAttribute(this.root, 'aria-label', () => t('uiChooseSkills'));
    const header = el('header', 'sp-header');
    const dismiss = this.button(() => (t('uiCloseSkillPicker')), () => this.close(), 'sp-close'); dismiss.innerHTML = close;
    header.append(el('h2', '', () => (t('uiChooseSkills'))), dismiss);
    const filter = el('label', 'sp-search'); const glyph = el('span'); glyph.innerHTML = search; glyph.setAttribute('aria-hidden', 'true');
    this.search.type = 'search'; bindAttribute(this.search, 'placeholder', () => (t('uiSearchSkills'))); bindAttribute(this.search, 'aria-label', () => t('uiSearchSkills'));
    filter.append(glyph, this.search); this.search.addEventListener('input', () => this.render());
    bindAttribute(this.list, 'aria-label', () => t('uiAvailableSkills')); this.status.setAttribute('role', 'status');
    const footer = el('footer', 'sp-footer'); footer.append(el('small', '', () => (t('uiInsertAtTheCursorAlongsideYourText'))), this.button(() => (t('skillsAction')), () => { this.close(); manage(); }, 'sp-manage'));
    bindAttribute(this.category, 'aria-label', () => t('uiFilterSkillsByCategory'));
    this.category.setAttribute('role', 'tablist');
    this.content.id = `skill-scenes-${crypto.randomUUID()}`; this.content.setAttribute('role', 'tabpanel');
    for (const [value, label] of [['all', () => t('uiAllCategories')], ['favorite', () => t('uiFavorites')], ['recent', () => t('uiRecent')], ...categories.map(c => [c.id, () => c.title] as const)] as const) {
      if (!value || !label) continue;
      const tab = this.button(label, () => this.selectCategory(value), 'sp-category-tab');
      tab.id = `${this.content.id}-${value}`; tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', this.content.id);
      tab.addEventListener('keydown', event => {
        const tabs = [...this.categoryTabs.keys()], index = tabs.indexOf(value);
        const target = event.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length] : event.key === 'ArrowLeft' ? tabs[(index + tabs.length - 1) % tabs.length] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : undefined;
        if (!target) return;
        event.preventDefault(); this.selectCategory(target); this.categoryTabs.get(target)?.focus();
      });
      this.categoryTabs.set(value, tab); this.category.append(tab);
    }
    this.updateCategoryTabs();
    this.detail.hidden = true;
    this.content.append(this.list, this.detail);
    this.root.append(header, el('p', 'sp-intro', () => (t('uiChooseACategoryToSeeWhatEach'))), filter, this.category, this.content, this.status, footer);
    this.root.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
    this.root.addEventListener('click', event => { if (event.target === this.root) this.close(); });
    document.body.append(this.root);
  }
  private button(label: TextValue, action: () => void, className: string): HTMLButtonElement {
    const button = el('button', className, label); button.type = 'button'; bindAttribute(button, 'aria-label', () => readText(label)); button.addEventListener('click', action); return button;
  }
  private announce(message: string, error = false): void {
    this.status.textContent = message; this.status.classList.toggle('is-error', error);
  }
  private updateCategoryTabs(): void {
    for (const [value, tab] of this.categoryTabs) {
      const selected = value === this.selectedCategory;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      if (selected) this.content.setAttribute('aria-labelledby', tab.id);
    }
  }
  private selectCategory(value: string): void {
    this.selectedCategory = value; this.updateCategoryTabs(); this.render(); this.list.scrollTop = 0;
    this.categoryTabs.get(value)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  async open(): Promise<void> {
    skillComposer(this.prompt).captureSelection();
    const revision = ++this.revision;
    if (!this.root.open) this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.search.value = ''; this.selectedCategory = 'all'; this.updateCategoryTabs(); this.detail.hidden = true; this.list.hidden = false; this.status.textContent = ''; this.catalog = []; this.prefs = loadSkillPreferences();
    this.list.replaceChildren(el('p', 'sp-empty', () => (t('uiLoadingSkills')))); this.drawer.show(); this.search.focus();
    this.category.scrollLeft = 0; this.list.scrollTop = 0;
    try {
      const catalog = z.array(skillInfoSchema).parse(await agentRPC({ type: 'agent:skills-list' }));
      if (revision !== this.revision || !this.root.open) return;
      this.catalog = catalog.filter(skill => skill.enabled); skillComposer(this.prompt).registerCatalog(catalog); this.render();
    } catch {
      if (revision !== this.revision || !this.root.open) return;
      this.list.replaceChildren(el('p', 'sp-empty', () => (t('uiCouldNotLoadSkillsTryAgain'))), this.button(() => (t('uiReload')), () => { void this.open(); }, 'sp-retry'));
    }
  }
  private selected(): Set<string> { return new Set([...skillComposer(this.prompt).names, ...[...this.prompt.value.matchAll(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)(?=\s|$)/gm)].map(match => match[1]).filter((name): name is string => name !== undefined)]); }
  private render(): void {
    this.list.replaceChildren();
    const query = this.search.value.trim().toLocaleLowerCase();
    this.detail.hidden = true; this.list.hidden = false;
    const selectedCategory = this.selectedCategory;
    const items = this.catalog.filter(info => matchesSkill(info, query) && (selectedCategory === 'all' || (selectedCategory === 'favorite' ? this.prefs.favorites.includes(info.name) : selectedCategory === 'recent' ? this.prefs.recent.includes(info.name) : productFor(info).category === selectedCategory)));
    if (!items.length) {
      const message = () => query ? t('uiNoMatchingSkillsTryAnotherSearchTerm') : selectedCategory === 'favorite' ? t('uiNoFavoritesYetSelectTheHeartNext') : selectedCategory === 'recent' ? t('uiSkillsYouUseWillAppearHere') : selectedCategory === 'all' ? t('uiNoSkillsAreAvailableAddOrEnable') : t('uiNoSkillsAreAvailableInThisCategory');
      this.list.append(el('p', 'sp-empty', message)); return;
    }
    const selected = this.selected();
    const groups = selectedCategory === 'recent' ? [{id:'recent',get title() { return t('uiRecent'); }}] : categories;
    for (const category of groups) {
      const group = selectedCategory === 'recent' ? [...items].sort((a,b) => this.prefs.recent.indexOf(a.name)-this.prefs.recent.indexOf(b.name)) : items.filter(info => productFor(info).category === category.id); if (!group.length) continue;
      this.list.append(el('h3', 'sp-group', () => category.title));
      for (const info of group) {
        const p = productFor(info);
        const item = el('div', 'sp-item');
        const row = this.button(() => (t('uiUseValue1', { value1: p.title })), () => this.choose(info), 'sp-choice');
        const icon = el('span', 'sp-symbol'); icon.innerHTML = puzzle; icon.setAttribute('aria-hidden', 'true');
        const copy = el('span', 'sp-copy'); copy.append(el('strong', '', () => p.title), el('small', '', () => p.summary));
        row.replaceChildren(icon, copy); bindAttribute(row, 'title', () => info.source === 'builtin' ? p.summary : info.description);
        if (selected.has(info.name)) row.append(el('span', 'sp-picked', () => (t('uiAdded'))));
        const actions = el('div', 'sp-item-actions');
        const favorite = this.button(() => (t('uiFavoriteValue1', { value1: p.title })), () => {
          const isFavorite = this.prefs.favorites.includes(info.name);
          const next = { ...this.prefs, favorites: isFavorite ? this.prefs.favorites.filter(name => name !== info.name) : [...this.prefs.favorites, info.name] };
          if (!saveSkillPreferences(next)) { this.announce(t('uiCouldNotSaveFavoritesTryAgain'), true); return; }
          this.prefs = next;
          if (isFavorite && this.selectedCategory === 'favorite') {
            const index = [...this.list.querySelectorAll('.sp-favorite')].indexOf(favorite);
            this.render();
            const remaining = [...this.list.querySelectorAll<HTMLButtonElement>('.sp-favorite')];
            (remaining[Math.min(index, remaining.length - 1)] ?? this.categoryTabs.get('favorite'))?.focus();
          } else updateFavoriteButton(favorite, !isFavorite, () => p.title);
          this.announce(`${isFavorite ? t('uiRemovedFromFavorites') : t('uiAddedToFavorites')}：${p.title}`);
        }, 'sp-favorite');
        updateFavoriteButton(favorite, this.prefs.favorites.includes(info.name), () => p.title);
        const about = this.button(() => (t('uiViewDetailsForValue1', { value1: p.title })), () => this.showDetail(info), 'sp-about'); bindText(about, () => (t('uiDetails')));
        actions.append(about, favorite); item.append(row, actions); this.list.append(item);
      }
    }
  }
  private showDetail(info: SkillInfo): void {
    const p = productFor(info); this.list.hidden = true; this.detail.hidden = false;
    const section = (heading: TextValue, text: TextValue) => { this.detail.append(el('h3', '', heading), el('p', '', text)); };
    const back = this.button(() => (t('uiBackToSkills2')), () => { this.render(); this.search.focus(); }, 'sp-manage');
    this.detail.replaceChildren(back, el('h2', '', () => p.title), el('p', '', () => p.summary));
    for (const id of new Set(p.connections ?? (info.name === 'apify-google-maps-leads' ? ['apify'] as const : []))) {
      this.detail.append(connectorDependency(id, () => {
        this.root.close();
        openConnector(id, () => { this.drawer.show(); this.showDetail(info); });
      }));
    }
    section(() => t('uiWhatYouNeed2'), p.inputs.join('、') || t('uiPrepareTheMaterialsDescribedInTheSkill'));
    section(() => t('uiWhatYouGet'), p.outputs.join('、') || t('uiSeeTheSkillDescriptionForItsDeliverables'));
    section(() => t('uiRequirements'), p.requirements);
    if (info.diagnostics.length) section(() => t('uiCompatibilityNotes'), info.diagnostics.join(' '));
    if (p.example) section(() => t('uiTryThisRequest'), p.example);
    this.detail.append(this.button(() => (t('uiUseForThisTask')), () => this.choose(info), 'sp-use'));
    back.focus();
  }
  private choose(info: SkillInfo): void {
    const selected = this.selected();
    if (!selected.has(info.name) && selected.size >= 4) { this.announce(t('uiYouCanUseUpTo4Skills'), true); return; }
    skillComposer(this.prompt).add(info);
    this.prefs.recent = [info.name, ...this.prefs.recent.filter(name => name !== info.name)].slice(0,20); saveSkillPreferences(this.prefs);
    this.close(); skillComposer(this.prompt).focus();
  }
  close(): void { ++this.revision; this.root.close(); if (this.opener?.isConnected) this.opener.focus(); else this.prompt.focus(); }
  dispose(): void { ++this.revision; this.drawer.dispose(); this.root.remove(); }
}
