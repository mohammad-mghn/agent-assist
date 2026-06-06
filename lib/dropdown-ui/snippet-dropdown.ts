import { CONTENT_TRUNCATE_LEN, MAX_DROPDOWN_ITEMS } from '@/shared/constants';
import type { UiTheme } from '@/shared/types';
import { dropdownPosition } from '@/lib/dropdown-position';
import { buildDropdownStyles } from '@/lib/dropdown-styles';
import { findDropdownMountPoint } from '@/lib/dropdown-ui/mount-point';
import type { DropdownItem } from '@/lib/shortcut-index';
import { truncate } from '@/lib/utils';
import { escapeHtml, renderShortcutHighlight } from './html';

export class SnippetDropdown {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private styleEl: HTMLStyleElement;
  private panel: HTMLDivElement;
  private theme: UiTheme;
  private emptyLabel: string;
  private activeIndex = 0;
  private items: DropdownItem[] = [];
  private onPick: (item: DropdownItem) => void;
  private onClose: () => void;
  private mountContainer: HTMLElement = document.body;

  constructor(
    onPick: (item: DropdownItem) => void,
    onClose: () => void,
    theme: UiTheme = 'light',
    emptyLabel = 'No matching shortcuts',
  ) {
    this.onPick = onPick;
    this.onClose = onClose;
    this.theme = theme;
    this.emptyLabel = emptyLabel;
    this.host = document.createElement('div');
    this.host.setAttribute('data-snippet-assist', 'dropdown');
    this.shadow = this.host.attachShadow({ mode: 'closed' });
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = buildDropdownStyles(theme);
    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    this.panel.addEventListener('mousedown', (e) => e.preventDefault());
    this.panel.addEventListener('click', (e) => {
      const row = (e.target as HTMLElement).closest('.row');
      if (!row) return;
      const idx = Number.parseInt(row.getAttribute('data-idx') ?? '', 10);
      if (!Number.isNaN(idx)) this.pickIndex(idx);
    });
    this.shadow.append(this.styleEl, this.panel);
    this.host.style.display = 'none';
    document.body.appendChild(this.host);
  }

  getHostElement(): HTMLDivElement {
    return this.host;
  }

  show(items: DropdownItem[], rect: DOMRect, activeIndex = 0, anchor?: HTMLElement): void {
    if (anchor) this.reparentTo(anchor);
    this.items = items.slice(0, MAX_DROPDOWN_ITEMS);
    this.activeIndex = Math.min(activeIndex, Math.max(0, this.items.length - 1));
    this.render();
    const { left, top } = dropdownPosition(
      rect,
      this.mountContainer,
      this.panel.offsetHeight,
      this.panel.offsetWidth,
    );
    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
    this.host.style.display = 'block';
  }

  hide(): void {
    this.host.style.display = 'none';
    this.items = [];
    this.reparentTo(document.body);
  }

  reparentTo(anchor: HTMLElement): void {
    const next = findDropdownMountPoint(anchor);
    if (next === this.mountContainer) return;
    next.appendChild(this.host);
    this.mountContainer = next;
  }

  destroy(): void {
    this.host.remove();
  }

  setTheme(theme: UiTheme): void {
    this.theme = theme;
    this.styleEl.textContent = buildDropdownStyles(theme);
  }

  setEmptyLabel(label: string): void {
    this.emptyLabel = label;
    if (this.items.length === 0) this.render();
  }

  getItems(): DropdownItem[] {
    return this.items;
  }

  getActiveIndex(): number {
    return this.activeIndex;
  }

  setActiveIndex(index: number): void {
    if (this.items.length === 0) return;
    this.activeIndex = ((index % this.items.length) + this.items.length) % this.items.length;
    this.render();
    const active = this.panel.querySelector('.row.active');
    active?.scrollIntoView({ block: 'nearest' });
  }

  pickActive(): void {
    const item = this.items[this.activeIndex];
    if (item) this.onPick(item);
  }

  pickIndex(index: number): void {
    const item = this.items[index];
    if (item) this.onPick(item);
  }

  private render(): void {
    if (this.items.length === 0) {
      this.panel.innerHTML = `<div class="empty">${escapeHtml(this.emptyLabel)}</div>`;
      return;
    }

    this.panel.innerHTML = this.items
      .map((item, i) => {
        const active = i === this.activeIndex ? ' active' : '';
        const trigger = item.trigger;
        const preview = truncate(item.shortcut.content, CONTENT_TRUNCATE_LEN);
        const chipColor = item.category.color;
        return `<div class="row${active}" data-idx="${i}">
          <span class="idx">${i + 1}</span>
          <span class="name" dir="auto">${escapeHtml(item.shortcut.name)}</span>
          <span class="shortcut-wrap" dir="ltr">${renderShortcutHighlight(trigger, item.shortcut.shortcut, item.query)}</span>
          <span class="chip" dir="auto" style="background:${chipColor}">${escapeHtml(item.category.name)}</span>
          <span class="preview" dir="auto">${escapeHtml(preview)}</span>
        </div>`;
      })
      .join('');
  }
}
