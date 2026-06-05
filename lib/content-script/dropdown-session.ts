import { SnippetDropdown, getCaretRect } from '@/lib/dropdown-ui';
import { translate } from '@/lib/i18n/translations';
import {
  getContentEditableTrigger,
  getDeepActiveElement,
  getTextareaTrigger,
  insertIntoElement,
  resolveEligibleElement,
} from '@/lib/insert-text';
import {
  filterShortcuts,
  shouldKeepSnippetDropdownOpen,
} from '@/lib/snippet-dropdown';
import { findExactShortcut } from '@/lib/shortcut-index';
import type { AppData, UiLocale, UiTheme } from '@/shared/types';

export interface SnippetAssistSession {
  appData: AppData | null;
  extensionEnabled: boolean;
  dropdownEnabled: boolean;
  uiTheme: UiTheme;
  uiLocale: UiLocale;
  dropdown: SnippetDropdown | null;
  open: boolean;
}

export function createSnippetAssistSession(): SnippetAssistSession {
  return {
    appData: null,
    extensionEnabled: true,
    dropdownEnabled: true,
    uiTheme: 'light',
    uiLocale: 'en-US',
    dropdown: null,
    open: false,
  };
}

export function closeDropdown(session: SnippetAssistSession): void {
  session.open = false;
  session.dropdown?.hide();
}

export function ensureDropdown(session: SnippetAssistSession): SnippetDropdown {
  if (!session.dropdown) {
    session.dropdown = new SnippetDropdown(
      (item) => {
        const el = resolveEligibleElement(getDeepActiveElement());
        if (!el) return;
        insertIntoElement(
          el,
          item.trigger,
          item.query,
          item.shortcut.content,
        );
        closeDropdown(session);
      },
      () => closeDropdown(session),
      session.uiTheme,
      translate(session.uiLocale, 'dropdown.noMatches'),
    );
  }
  return session.dropdown;
}

function getTriggerState(el: HTMLElement) {
  return el instanceof HTMLTextAreaElement
    ? getTextareaTrigger(el)
    : getContentEditableTrigger(el);
}

export function updateDropdown(
  session: SnippetAssistSession,
  el: HTMLElement,
): void {
  if (!session.appData || !session.extensionEnabled || !session.dropdownEnabled) {
    closeDropdown(session);
    return;
  }

  const state = getTriggerState(el);
  if (!state) {
    closeDropdown(session);
    return;
  }

  const items = filterShortcuts(session.appData, state.trigger, state.query);
  if (
    !shouldKeepSnippetDropdownOpen(
      session.appData,
      state.trigger,
      state.query,
      items,
    )
  ) {
    closeDropdown(session);
    return;
  }

  const ui = ensureDropdown(session);
  session.open = true;
  ui.show(items, getCaretRect(el), ui.getActiveIndex());
}

export function tryExactInsert(
  session: SnippetAssistSession,
  el: HTMLElement,
): boolean {
  if (!session.appData || !session.extensionEnabled) return false;
  const state = getTriggerState(el);
  if (!state) return false;
  const exact = findExactShortcut(session.appData, state.trigger, state.query);
  if (!exact) return false;
  insertIntoElement(el, state.trigger, state.query, exact.content);
  closeDropdown(session);
  return true;
}
