import { findExactShortcut, filterShortcuts, type DropdownItem } from './shortcut-index';
import type { AppData, TriggerChar } from '../shared/types';

export function isSnippetDropdownEvent(path: EventTarget[]): boolean {
  return path.some(
    (n) =>
      n instanceof HTMLElement &&
      n.getAttribute?.('data-snippet-assist') === 'dropdown',
  );
}

export function shouldKeepSnippetDropdownOpen(
  data: AppData,
  trigger: TriggerChar,
  query: string,
  items: DropdownItem[],
): boolean {
  if (items.length > 0) return true;
  if (query.length === 0) return true;
  return !!findExactShortcut(data, trigger, query);
}

export interface SnippetDropdownKeyboardHandlers {
  open: boolean;
  itemCount: number;
  close: () => void;
  onArrowDown: () => void;
  onArrowUp: () => void;
  pickIndex: (index: number) => void;
  pickActive: () => void;
  tryExactInsert: () => boolean;
  tryJumpStopAdvance?: () => boolean;
  onTriggerTyped: () => void;
}

export function handleSnippetDropdownKeydown(
  e: KeyboardEvent,
  handlers: SnippetDropdownKeyboardHandlers,
): void {
  if (e.key === '/' || e.key === '#') {
    handlers.onTriggerTyped();
  }

  if (handlers.open) {
    if (e.key === 'Escape') {
      e.preventDefault();
      handlers.close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handlers.onArrowDown();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handlers.onArrowUp();
      return;
    }

    if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < handlers.itemCount) {
        e.preventDefault();
        handlers.pickIndex(idx);
      }
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      if (handlers.itemCount > 0) {
        e.preventDefault();
        handlers.pickActive();
        return;
      }
      if (handlers.tryExactInsert()) {
        e.preventDefault();
      }
      return;
    }

    return;
  }

  if (e.key === 'Enter' || e.key === 'Tab') {
    if (handlers.tryJumpStopAdvance?.()) {
      e.preventDefault();
      return;
    }
    if (handlers.tryExactInsert()) e.preventDefault();
  }
}

export { filterShortcuts, type DropdownItem };
