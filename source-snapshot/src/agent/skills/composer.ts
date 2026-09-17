import { t } from '../../i18n/runtime';
import { bindAttribute } from '../../i18n/dom';
import puzzle from '@tabler/icons/outline/puzzle.svg?raw';
import shield from '@tabler/icons/outline/shield-check.svg?raw';
import { element as el } from '../prompts/ui';
import { productFor } from './catalog';
import type { SkillInfo } from './model';
import { skillNames, skillReference, inlineSkillPattern } from './references';
import styles from './composer.css';

interface SelectedSkill { id: string; info: SkillInfo }
const composers = new WeakMap<HTMLTextAreaElement, SkillComposer>();
export function skillComposer(prompt: HTMLTextAreaElement): SkillComposer {
  let composer = composers.get(prompt);
  if (!composer) { composer = new SkillComposer(prompt); composers.set(prompt, composer); }
  return composer;
}
/** Inline atoms use the textarea as the existing send/attachment integration boundary. */
export class SkillComposer {
  readonly root = el('div', 'skill-composer');
  readonly editor = el('div', 'skill-editor');
  private catalog = new Map<string, SkillInfo>();
  private saved?: Range;
  private selected?: HTMLElement;
  private syncing = false;
  private composing = false;
  private history: string[] = [];
  private historyIndex = -1;
  private tooltip = el('div', 'skill-token-tooltip');
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private hoveredChip?: HTMLElement;
  private dismissTooltip = (): void => this.hideTooltip();
  private onSelection = (): void => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;
    this.saved = range.cloneRange();
    if (range.collapsed) this.clearSelected();
  };
  private onExternalInput = (): void => {
    if (this.syncing) return;
    this.hideTooltip();
    if (this.root.hidden) {
      if ([...this.prompt.value.matchAll(inlineSkillPattern())].some(match => this.catalog.has(match[2]!))) this.activate();
      return;
    }
    if (this.serialize(this.editor) !== this.prompt.value) {
      this.render(this.prompt.value); this.remember();
    }
  };
  private onPromptFocus = (): void => { if (!this.root.hidden) this.focus(); };
  private readonly promptAttributes = new MutationObserver(() => this.syncPromptAttributes());
  private syncPromptAttributes(): void {
    bindAttribute(this.editor, 'aria-label', () => this.prompt.getAttribute('aria-label') || t('taskLabel'));
    bindAttribute(this.editor, 'data-placeholder', () => this.prompt.placeholder || t('taskPlaceholder'));
  }
  constructor(private prompt: HTMLTextAreaElement) {
    if (!document.getElementById('skill-composer-style')) {
      const style = el('style'); style.id = 'skill-composer-style'; style.textContent = styles; document.head.append(style);
    }
    this.editor.setAttribute('contenteditable', 'true'); this.editor.tabIndex = 0; this.editor.setAttribute('role', 'textbox');
    this.editor.setAttribute('aria-multiline', 'true'); this.syncPromptAttributes();
    this.promptAttributes.observe(prompt, { attributes: true, attributeFilter: ['aria-label', 'placeholder'] });
    this.tooltip.id = `skill-tooltip-${crypto.randomUUID()}`; this.tooltip.setAttribute('role', 'tooltip'); this.tooltip.hidden = true;
    this.root.hidden = true; prompt.before(this.root); this.root.append(this.editor, this.tooltip);
    this.tooltip.addEventListener('pointerenter', () => clearTimeout(this.hideTimer));
    this.tooltip.addEventListener('pointerleave', () => this.leaveTooltip());
    this.editor.addEventListener('pointerdown', this.dismissTooltip);
    this.editor.addEventListener('focusout', this.dismissTooltip);
    this.editor.addEventListener('input', () => { this.hideTooltip(); this.sync(); if (!this.composing) this.remember(); });
    this.editor.addEventListener('compositionstart', () => { this.hideTooltip(); this.composing = true; prompt.dispatchEvent(new CompositionEvent('compositionstart')); });
    this.editor.addEventListener('compositionend', () => { this.composing = false; this.sync(); this.remember(); prompt.dispatchEvent(new CompositionEvent('compositionend')); });
    this.editor.addEventListener('keydown', event => this.keydown(event));
    this.editor.addEventListener('beforeinput', event => {
      this.hideTooltip();
      if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') { event.preventDefault(); this.undo(event.inputType === 'historyRedo'); }
      else if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') { event.preventDefault(); this.insert(document.createTextNode('\n')); }
    });
    this.editor.addEventListener('paste', event => {
      const forwarded = new ClipboardEvent('paste', { clipboardData: event.clipboardData, bubbles: true, cancelable: true });
      prompt.dispatchEvent(forwarded); event.preventDefault();
      if (!forwarded.defaultPrevented) this.insert(this.fragment(event.clipboardData?.getData('text/plain') || ''));
    });
    for (const type of ['copy', 'cut'] as const) this.editor.addEventListener(type, event => {
      const selection = window.getSelection(); if (!selection?.rangeCount || selection.isCollapsed) return;
      event.clipboardData?.setData('text/plain', this.serialize(selection.getRangeAt(0).cloneContents())); event.preventDefault();
      if (type === 'cut') this.insert(document.createTextNode(''));
    });
    // Browser drag/drop must not inject HTML or split a non-editable skill atom.
    this.editor.addEventListener('drop', event => event.preventDefault());
    document.addEventListener('selectionchange', this.onSelection);
    prompt.addEventListener('input', this.onExternalInput); prompt.addEventListener('focus', this.onPromptFocus);
  }
  get names(): string[] { return skillNames(this.prompt.value); }
  registerCatalog(infos: readonly SkillInfo[]): void {
    for (const info of infos) this.catalog.set(info.name, info);
    this.onExternalInput();
    if (!this.root.hidden) {
      const count = [...this.prompt.value.matchAll(inlineSkillPattern())].filter(match => this.catalog.has(match[2]!)).length;
      if (count !== this.editor.querySelectorAll('.skill-token').length) this.render(this.prompt.value);
    }
  }
  captureSelection(): void { this.onSelection(); }
  private activate(): void {
    const start = this.prompt.selectionStart, end = this.prompt.selectionEnd;
    this.root.hidden = false; this.prompt.classList.add('skill-textarea-bridge'); this.prompt.setAttribute('aria-hidden', 'true'); this.prompt.tabIndex = -1;
    this.render(this.prompt.value); this.setOffsets(start, end); this.remember();
  }
  focus(): void {
    this.editor.focus(); const selection = window.getSelection();
    if (this.saved && this.editor.contains(this.saved.commonAncestorContainer)) { selection?.removeAllRanges(); selection?.addRange(this.saved); }
    else this.caretAtEnd();
  }
  add(info: SkillInfo): void {
    if (new Set([...this.names, info.name]).size > 4) throw new Error(t('uiYouCanUseUpTo4Skills2'));
    this.catalog.set(info.name, info);
    if (this.root.hidden) this.activate(); else this.onExternalInput();
    this.insert(this.chip(info));
  }
  private serialize(node: Node): string {
    if (node instanceof HTMLElement && node.dataset.skillReference) return node.dataset.skillReference;
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node instanceof HTMLBRElement) return node.dataset.caret === 'true' ? '' : '\n';
    return [...node.childNodes].map(child => this.serialize(child)).join('');
  }
  private sync(): void {
    if (this.editor.childNodes.length === 1 && this.editor.firstChild instanceof HTMLBRElement) this.editor.firstChild.dataset.caret = 'true';
    this.onSelection(); this.syncing = true; this.prompt.value = this.serialize(this.editor);
    this.editor.dataset.empty = String(!this.prompt.value); this.prompt.dispatchEvent(new Event('input', { bubbles: true })); this.syncing = false;
  }
  private remember(): void {
    const text = this.prompt.value; if (this.history[this.historyIndex] === text) return;
    this.history = this.history.slice(0, this.historyIndex + 1); this.history.push(text);
    if (this.history.length > 100) this.history.shift(); this.historyIndex = this.history.length - 1;
  }
  private undo(redo: boolean): void {
    const next = this.historyIndex + (redo ? 1 : -1), text = this.history[next]; if (text === undefined) return;
    this.historyIndex = next; this.render(text); this.caretAtEnd(); this.sync();
  }
  private insert(node: Node): void {
    this.focus(); const selection = window.getSelection(), range = selection?.rangeCount ? selection.getRangeAt(0) : undefined;
    if (!range || !this.editor.contains(range.commonAncestorContainer)) return;
    const tail = node instanceof DocumentFragment ? node.lastChild : node; if (!tail) return;
    range.deleteContents(); range.insertNode(node); range.setStartAfter(tail); range.collapse(true);
    selection?.removeAllRanges(); selection?.addRange(range); this.saved = range.cloneRange();
    this.clearSelected(); this.sync(); this.remember();
  }
  private caretAtEnd(): void {
    const range = document.createRange(); range.selectNodeContents(this.editor);
    const last = this.editor.lastChild; if (last instanceof HTMLBRElement && last.dataset.caret) range.setEndBefore(last);
    range.collapse(false); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); this.saved = range.cloneRange();
  }
  private setOffsets(start: number, end: number): void {
    const point = (offset: number): [Node, number] => {
      for (const child of this.editor.childNodes) {
        const length = this.serialize(child).length;
        if (offset <= length && child.nodeType === Node.TEXT_NODE) return [child, offset];
        if (offset < length) return [this.editor, [...this.editor.childNodes].indexOf(child)];
        offset -= length;
      }
      return [this.editor, Math.max(0, this.editor.childNodes.length - 1)];
    };
    const range = document.createRange(); range.setStart(...point(start)); range.setEnd(...point(end)); this.saved = range;
  }
  private clearSelected(): void { this.selected?.setAttribute('aria-pressed', 'false'); this.selected = undefined; this.hideTooltip(); }
  private select(chip: HTMLElement): void {
    this.clearSelected(); this.editor.focus(); this.selected = chip; chip.setAttribute('aria-pressed', 'true');
    const range = document.createRange(); range.selectNode(chip); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); this.saved = range.cloneRange();
  }
  private keydown(event: KeyboardEvent): void {
    this.hideTooltip();
    if (event.isComposing || this.composing) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); this.undo(event.shiftKey); return; }
    if (this.selected && (event.key === 'Backspace' || event.key === 'Delete')) { event.preventDefault(); this.insert(document.createTextNode('')); return; }
    if (this.selected && ['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); const range = document.createRange();
      if (event.key === 'ArrowLeft') range.setStartBefore(this.selected); else range.setStartAfter(this.selected);
      range.collapse(true); this.saved = range; this.clearSelected(); this.focus(); return;
    }
    const selection = window.getSelection();
    if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && selection?.isCollapsed && selection.rangeCount && (event.key === 'Backspace' || event.key === 'Delete')) {
      const range = selection.getRangeAt(0), backward = event.key === 'Backspace'; let node: Node | null = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''; if (backward ? range.startOffset !== 0 : range.startOffset !== text.length) node = null;
        else node = backward ? node.previousSibling : node.nextSibling;
      } else node = node.childNodes[range.startOffset + (backward ? -1 : 0)] || null;
      while (node?.nodeType === Node.TEXT_NODE && !node.textContent) node = backward ? node.previousSibling : node.nextSibling;
      if (node instanceof HTMLElement && node.dataset.skillReference) { event.preventDefault(); this.select(node); return; }
    }
    const forwarded = new KeyboardEvent('keydown', { key: event.key, code: event.code, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey, bubbles: false, cancelable: true });
    this.prompt.dispatchEvent(forwarded); if (forwarded.defaultPrevented) event.preventDefault();
  }
  private hideTooltip(): void {
    clearTimeout(this.showTimer); clearTimeout(this.hideTimer);
    this.showTimer = undefined; this.hideTimer = undefined; this.hoveredChip = undefined; this.tooltip.hidden = true;
    window.removeEventListener('resize', this.dismissTooltip);
    window.removeEventListener('blur', this.dismissTooltip);
    document.removeEventListener('scroll', this.dismissTooltip, true);
    document.removeEventListener('keydown', this.dismissTooltip, true);
    document.removeEventListener('pointerdown', this.dismissTooltip, true);
  }
  private leaveTooltip(): void {
    clearTimeout(this.showTimer); this.showTimer = undefined; this.hoveredChip = undefined;
    clearTimeout(this.hideTimer);
    if (!this.tooltip.hidden) this.hideTimer = setTimeout(() => this.hideTooltip(), 120);
  }
  private hoverTooltip(event: PointerEvent, item: SelectedSkill, chip: HTMLElement): void {
    if (event.pointerType === 'touch' || event.buttons) return;
    clearTimeout(this.hideTimer);
    if (this.hoveredChip === chip) return;
    this.hideTooltip(); this.hoveredChip = chip;
    window.addEventListener('resize', this.dismissTooltip);
    window.addEventListener('blur', this.dismissTooltip);
    document.addEventListener('scroll', this.dismissTooltip, true);
    document.addEventListener('keydown', this.dismissTooltip, true);
    document.addEventListener('pointerdown', this.dismissTooltip, true);
    // Layout changes while typing can emit pointerenter without a mouse movement.
    // Only actual pointer movement over a chip may start the hover delay.
    this.showTimer = setTimeout(() => {
      this.showTimer = undefined;
      if (this.hoveredChip === chip && chip.isConnected && !this.root.hidden && !this.composing) this.showTooltip(item, chip);
    }, 240);
  }
  private showTooltip(item: SelectedSkill, button: HTMLElement): void {
    const product = productFor(item.info), icon = el('span', 'skill-token-symbol'); icon.innerHTML = puzzle; icon.setAttribute('aria-hidden', 'true');
    const source = el('span', 'skill-token-source'); const sourceIcon = el('span'); sourceIcon.innerHTML = shield; sourceIcon.setAttribute('aria-hidden', 'true');
    source.append(sourceIcon, document.createTextNode(item.info.source === 'builtin' ? t('uiBuiltinSkill') : t('uiImported')));
    this.tooltip.replaceChildren(icon, el('strong', '', () => product.title), el('p', '', product.summary || item.info.description), source, el('small', '', () => (t('uiClickToSelectPressBackspaceOrDelete'))));
    this.tooltip.hidden = false;
    const rect = button.getBoundingClientRect(), height = this.tooltip.getBoundingClientRect().height;
    const width = Math.min(300, window.innerWidth - 24);
    this.tooltip.style.width = `${width}px`;
    this.tooltip.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    this.tooltip.style.top = `${Math.max(12, rect.top - height - 8)}px`;
  }
  private chip(info: SkillInfo): HTMLElement {
    const item = { id: crypto.randomUUID(), info }, product = productFor(info), chip = el('span', 'skill-token');
    chip.setAttribute('contenteditable', 'false'); chip.setAttribute('role', 'button'); chip.setAttribute('aria-pressed', 'false');
    chip.dataset.skillId = item.id; chip.dataset.skillReference = skillReference(info);
    bindAttribute(chip, 'aria-label', () => t('uiSelectSkillValue1', { value1: product.title })); chip.setAttribute('aria-describedby', this.tooltip.id);
    const icon = el('span', 'skill-token-symbol'); icon.innerHTML = puzzle; icon.setAttribute('aria-hidden', 'true');
    chip.append(icon, el('span', 'skill-token-label', () => product.title));
    chip.addEventListener('click', () => this.select(chip));
    chip.addEventListener('pointermove', event => this.hoverTooltip(event, item, chip));
    chip.addEventListener('pointerleave', () => this.leaveTooltip());
    return chip;
  }
  private fragment(text: string): DocumentFragment {
    const fragment = document.createDocumentFragment(); let offset = 0;
    for (const match of text.matchAll(inlineSkillPattern())) {
      const info = this.catalog.get(match[2]!); if (!info) continue;
      fragment.append(document.createTextNode(text.slice(offset, match.index)), this.chip(info)); offset = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(offset))); return fragment;
  }
  private render(text: string): void {
    this.clearSelected(); this.editor.replaceChildren(this.fragment(text));
    const caret = el('br'); caret.dataset.caret = 'true'; this.editor.append(caret); this.saved = undefined; this.editor.dataset.empty = String(!text);
  }
  dispose(): void {
    this.promptAttributes.disconnect(); this.hideTooltip(); document.removeEventListener('selectionchange', this.onSelection);
    this.prompt.removeEventListener('input', this.onExternalInput); this.prompt.removeEventListener('focus', this.onPromptFocus);
    this.prompt.classList.remove('skill-textarea-bridge'); this.prompt.removeAttribute('aria-hidden'); this.prompt.removeAttribute('tabindex');
    this.root.remove(); composers.delete(this.prompt);
  }
}
