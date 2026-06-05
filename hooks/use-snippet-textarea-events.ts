import { useEffect } from 'react';
import { isSnippetDropdownEvent } from '@/lib/snippet-dropdown';

interface UseSnippetTextareaEventsOptions {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  menuOpen: boolean;
  closeMenu: () => void;
  scheduleMenuUpdate: (el: HTMLTextAreaElement | null) => void;
}

export function useSnippetTextareaEvents({
  textareaRef,
  menuOpen,
  closeMenu,
  scheduleMenuUpdate,
}: UseSnippetTextareaEventsOptions) {
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const onInput = () => scheduleMenuUpdate(el);
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, [scheduleMenuUpdate, textareaRef]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menuOpen) return;
      const path = e.composedPath();
      const textarea = textareaRef.current;
      if (isSnippetDropdownEvent(path)) return;
      if (textarea && path.includes(textarea)) return;
      closeMenu();
    };

    const onScroll = (e: Event) => {
      if (!menuOpen) return;
      const path = e.composedPath?.() ?? [e.target];
      if (isSnippetDropdownEvent(path)) return;
      scheduleMenuUpdate(textareaRef.current);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [closeMenu, menuOpen, scheduleMenuUpdate, textareaRef]);
}
