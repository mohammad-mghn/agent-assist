import { useCallback, useEffect, useState } from 'react';
import { getCaretRect } from '@/lib/dropdown-ui';
import { getTextareaTrigger, insertIntoElement } from '@/lib/insert-text';
import {
  filterShortcuts,
  shouldKeepSnippetDropdownOpen,
} from '@/lib/snippet-dropdown';
import { findExactShortcut, type DropdownItem } from '@/lib/shortcut-index';
import type { AppData } from '@/shared/types';

interface UseSnippetMenuOptions {
  data: AppData;
  extensionEnabled: boolean;
  dropdownEnabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  syncValue: (el: HTMLTextAreaElement) => void;
}

export function useSnippetMenu({
  data,
  extensionEnabled,
  dropdownEnabled,
  textareaRef,
  syncValue,
}: UseSnippetMenuOptions) {
  const [menuItems, setMenuItems] = useState<DropdownItem[]>([]);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const menuOpen = menuRect !== null;

  const closeMenu = useCallback(() => {
    setMenuRect(null);
    setMenuItems([]);
  }, []);

  const tryExactInsert = useCallback(
    (el: HTMLTextAreaElement): boolean => {
      if (!extensionEnabled) return false;
      const state = getTextareaTrigger(el);
      if (!state) return false;
      const exact = findExactShortcut(data, state.trigger, state.query);
      if (!exact) return false;
      insertIntoElement(el, state.trigger, state.query, exact.content);
      syncValue(el);
      closeMenu();
      return true;
    },
    [closeMenu, data, extensionEnabled, syncValue],
  );

  const updateMenu = useCallback(
    (el: HTMLTextAreaElement | null) => {
      if (!el) return;

      if (!extensionEnabled || !dropdownEnabled) {
        closeMenu();
        return;
      }

      const state = getTextareaTrigger(el);
      if (!state) {
        closeMenu();
        return;
      }

      const items = filterShortcuts(data, state.trigger, state.query);
      if (
        !shouldKeepSnippetDropdownOpen(data, state.trigger, state.query, items)
      ) {
        closeMenu();
        return;
      }

      setMenuItems(items);
      setMenuRect(getCaretRect(el));
      setActiveIndex((index) => Math.min(index, Math.max(0, items.length - 1)));
    },
    [closeMenu, data, dropdownEnabled, extensionEnabled],
  );

  const scheduleMenuUpdate = useCallback(
    (el: HTMLTextAreaElement | null) => {
      if (!el) return;
      requestAnimationFrame(() => updateMenu(el));
    },
    [updateMenu],
  );

  const pickItem = useCallback(
    (item: DropdownItem) => {
      const el = textareaRef.current;
      if (!el) return;
      insertIntoElement(el, item.trigger, item.query, item.shortcut.content);
      syncValue(el);
      closeMenu();
    },
    [closeMenu, syncValue, textareaRef],
  );

  useEffect(() => {
    if (!extensionEnabled || !dropdownEnabled) {
      closeMenu();
    }
  }, [closeMenu, dropdownEnabled, extensionEnabled]);

  return {
    menuOpen,
    menuItems,
    menuRect,
    activeIndex,
    setActiveIndex,
    closeMenu,
    pickItem,
    tryExactInsert,
    scheduleMenuUpdate,
  };
}
