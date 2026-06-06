import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from 'react';
import { useSnippetMenu } from '@/hooks/use-snippet-menu';
import { useSnippetTextareaEvents } from '@/hooks/use-snippet-textarea-events';
import { getDeepActiveElement } from '@/lib/insert-text';
import { tryAdvanceJumpStopInElement } from '@/lib/jump-stop';
import { handleSnippetDropdownKeydown } from '@/lib/snippet-dropdown';
import { detectTextLang } from '@/lib/text-direction';
import type { AppData } from '@/shared/types';

interface UseSnippetTextareaOptions {
  data: AppData;
  dir: 'ltr' | 'rtl';
  locale: string;
}

export function useSnippetTextarea({ data, dir, locale }: UseSnippetTextareaOptions) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');

  const syncValue = useCallback((el: HTMLTextAreaElement) => {
    setValue(el.value);
  }, []);

  const {
    menuOpen,
    menuItems,
    menuRect,
    activeIndex,
    setActiveIndex,
    closeMenu,
    pickItem,
    tryExactInsert,
    scheduleMenuUpdate,
  } = useSnippetMenu({
    data,
    extensionEnabled: data.enabled,
    dropdownEnabled: data.dropdownEnabled ?? true,
    textareaRef,
    syncValue,
  });

  const onDocumentKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = textareaRef.current;
      if (!el || getDeepActiveElement() !== el) return;

      handleSnippetDropdownKeydown(e, {
        open: menuOpen,
        itemCount: menuItems.length,
        close: closeMenu,
        onArrowDown: () =>
          setActiveIndex((index) =>
            menuItems.length === 0 ? 0 : (index + 1) % menuItems.length,
          ),
        onArrowUp: () =>
          setActiveIndex((index) =>
            menuItems.length === 0
              ? 0
              : (index - 1 + menuItems.length) % menuItems.length,
          ),
        pickIndex: (index) => pickItem(menuItems[index]!),
        pickActive: () => pickItem(menuItems[activeIndex]!),
        tryExactInsert: () => tryExactInsert(el),
        tryJumpStopAdvance: () => tryAdvanceJumpStopInElement(el),
        onTriggerTyped: () => scheduleMenuUpdate(el),
      });
    },
    [
      activeIndex,
      closeMenu,
      menuItems,
      menuOpen,
      pickItem,
      scheduleMenuUpdate,
      setActiveIndex,
      tryExactInsert,
    ],
  );

  useSnippetTextareaEvents({
    textareaRef,
    menuOpen,
    closeMenu,
    scheduleMenuUpdate,
    onKeyDown: onDocumentKeyDown,
  });

  return {
    textareaRef,
    menuOpen,
    menuItems,
    menuRect,
    activeIndex,
    setActiveIndex,
    pickItem,
    textareaProps: {
      defaultValue: '',
      dir: (value.trim() ? 'auto' : dir) as 'ltr' | 'rtl' | 'auto',
      lang: value.trim() ? detectTextLang(value) : locale,
      className:
        'multilingual-field min-h-[8rem] w-full flex-1 cursor-text resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] xl:min-h-[10rem] 2xl:min-h-[12rem]',
      onChange: (e: ChangeEvent<HTMLTextAreaElement>) => syncValue(e.currentTarget),
      onFocus: (e: FocusEvent<HTMLTextAreaElement>) => scheduleMenuUpdate(e.currentTarget),
      onClick: (e: MouseEvent<HTMLTextAreaElement>) => scheduleMenuUpdate(e.currentTarget),
      onSelect: (e: SyntheticEvent<HTMLTextAreaElement>) => scheduleMenuUpdate(e.currentTarget),
      onKeyUp: (e: KeyboardEvent<HTMLTextAreaElement>) => scheduleMenuUpdate(e.currentTarget),
    },
  };
}
