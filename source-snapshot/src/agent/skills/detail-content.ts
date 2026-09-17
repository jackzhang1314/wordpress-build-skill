import { t } from '../../i18n/runtime';
import { bindText, bindAttribute, readText, type TextValue } from '../../i18n/dom';
import { renderMarkdown } from '../../lib/markdown-view';
import { connectorDependency } from '../connections/dependency';
import { settingsIcon } from '../../quick/settings-icons';
import { productFor } from './catalog';
import { fileText, type SkillPackage } from './model';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: TextValue): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.className = className; if (text) bindText(node, () => (readText(text))); return node;
}

/** One scroll surface for long skill documents; navigation remains visible. */
export function skillDetailContent(skill: SkillPackage): HTMLElement {
  const root = element('div', 'skill-detail-content'), tabs = element('div', 'skill-category-tabs skill-detail-tabs');
  const body = element('div', 'skill-detail-body'), overview = element('section', 'skill-overview');
  const method = element('section', 'skill-method'), files = element('section', 'skill-files');
  const product = productFor(skill);
  for (const id of new Set(product.connections ?? (skill.name === 'apify-google-maps-leads' ? ['apify'] as const : []))) overview.append(connectorDependency(id));
  tabs.setAttribute('role', 'tablist'); bindAttribute(tabs, 'aria-label', () => t('uiSkillDetails'));
  for (const [label, values] of [[() => t('uiWhatYouNeed'), product.inputs], [() => t('uiWhatYouGet'), product.outputs]] as const) {
    if (!values.length) continue;
    const section = element('section', 'skill-overview-section'), list = element('ul', '');
    for (const value of values) list.append(element('li', '', value));
    section.append(element('h4', '', label), list); overview.append(section);
  }
  if (product.example) {
    const example = element('section', 'skill-example');
    example.append(element('h4', '', () => (t('uiExampleRequest'))), element('p', '', product.example)); overview.append(example);
  }
  if (product.requirements) {
    const requirements = element('section', 'skill-overview-section');
    requirements.append(element('h4', '', () => (t('uiRequirements'))), element('p', '', product.requirements)); overview.append(requirements);
  }
  if (!overview.childElementCount) overview.append(element('p', 'skill-format', () => (t('uiThisSkillHasNoUsageGuideSee'))));
  if (skill.origin) {
    const { owner, repo, commit, path } = skill.origin;
    const link = element('a', 'skill-detail-origin', () => (t('uiFromGitHubValue1value2', { value1: owner, value2: repo })));
    link.href = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree/${commit}/${path.split('/').map(encodeURIComponent).join('/')}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; overview.append(link);
  }
  const methodToolbar = element('div', 'skill-method-toolbar'), sourceToggle = element('button', '', () => (t('uiViewSourceDocument')));
  sourceToggle.type = 'button'; sourceToggle.setAttribute('aria-pressed', 'false');
  const rendered = element('div', 'skill-rendered'), source = element('pre', 'skill-content', skill.body);
  renderMarkdown(rendered, skill.body, 'chat'); source.hidden = true;
  sourceToggle.addEventListener('click', () => {
    const showSource = source.hidden; source.hidden = !showSource; rendered.hidden = showSource;
    bindText(sourceToggle, () => (showSource ? t('uiReadingLayout') : t('uiViewSourceDocument'))); sourceToggle.setAttribute('aria-pressed', String(showSource));
  });
  methodToolbar.append(element('span', 'skill-format', () => (t('uiTheMethodAIFollowsForThisTask'))), sourceToggle);
  method.append(methodToolbar, rendered, source);

  const fileList = element('div', 'skill-file-list'), filePreview = element('div', 'skill-file-preview');
  const fileBack = element('button', 'skill-file-back', () => (t('uiBackToFileList'))), fileName = element('p', 'skill-file-name'), fileBody = element('pre', 'skill-content');
  fileBack.type = 'button'; filePreview.hidden = true;
  filePreview.append(fileBack, fileName, fileBody);
  for (const file of skill.files) {
    const button = element('button', 'skill-file-button'); button.type = 'button';
    button.append(settingsIcon('document'), element('span', '', file.path), settingsIcon('chevron'));
    button.addEventListener('click', () => {
      fileName.textContent = file.path;
      try { fileBody.textContent = fileText(file); } catch { bindText(fileBody, () => (t('uiThisFileCannotBePreviewedAsText'))); }
      fileList.hidden = true; filePreview.hidden = false; body.scrollTop = 0; fileBack.focus();
      fileBack.onclick = () => { fileList.hidden = false; filePreview.hidden = true; body.scrollTop = 0; button.focus(); };
    });
    fileList.append(button);
  }
  if (!skill.files.length) fileList.append(element('p', 'skill-format', () => (t('uiThisSkillHasNoAttachedFilesSee'))));
  files.append(fileList, filePreview);
  const panels = [overview, method, files], labels = [() => t('uiOverview'), () => t('uiMethod'), () => t('uiFilesValue1', { value1: skill.files.length })];
  const buttons: HTMLButtonElement[] = [], prefix = `skill-detail-${crypto.randomUUID()}`;
  const select = (index: number) => {
    panels.forEach((panel, i) => { panel.hidden = i !== index; const button = buttons[i]; if (button) { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; } });
    body.scrollTop = 0;
  };
  panels.forEach((panel, index) => {
    const button = element('button', 'skill-category-tab', labels[index]); button.type = 'button'; button.id = `${prefix}-tab-${index}`;
    panel.id = `${prefix}-panel-${index}`; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id); panel.tabIndex = 0;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % panels.length : event.key === 'ArrowLeft' ? (index + panels.length - 1) % panels.length : event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : undefined;
      if (next === undefined) return; event.preventDefault(); select(next); buttons[next]?.focus();
    });
    buttons.push(button); tabs.append(button); body.append(panel);
  });
  select(0); root.append(tabs, body); return root;
}
