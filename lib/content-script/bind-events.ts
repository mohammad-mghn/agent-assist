import {
  handleSnippetDropdownKeydown,
  isSnippetDropdownEvent,
} from '@/lib/snippet-dropdown';
import {
  closeDropdown,
  type SnippetAssistSession,
  tryExactInsert,
  updateDropdown,
} from '@/lib/content-script/dropdown-session';
import { resolveEligibleElement } from '@/lib/insert-text';

export function bindSnippetAssistEvents(session: SnippetAssistSession): void {
  document.addEventListener(
    'input',
    (e) => {
      const el = resolveEligibleElement(e.target, e.composedPath());
      if (!el) return;
      updateDropdown(session, el);
    },
    true,
  );

  document.addEventListener(
    'keydown',
    (e) => {
      const el = resolveEligibleElement(e.target, e.composedPath());
      if (!el) {
        if (session.open) closeDropdown(session);
        return;
      }

      const ui = session.open ? session.dropdown : null;
      const items = ui?.getItems() ?? [];

      handleSnippetDropdownKeydown(e, {
        open: session.open,
        itemCount: items.length,
        close: () => closeDropdown(session),
        onArrowDown: () => ui?.setActiveIndex(ui.getActiveIndex() + 1),
        onArrowUp: () => ui?.setActiveIndex(ui.getActiveIndex() - 1),
        pickIndex: (index) => ui?.pickIndex(index),
        pickActive: () => ui?.pickActive(),
        tryExactInsert: () => tryExactInsert(session, el),
        onTriggerTyped: () => queueMicrotask(() => updateDropdown(session, el)),
      });
    },
    true,
  );

  document.addEventListener(
    'click',
    (e) => {
      if (!session.open) return;
      if (!isSnippetDropdownEvent(e.composedPath())) closeDropdown(session);
    },
    true,
  );

  document.addEventListener(
    'scroll',
    () => {
      if (session.open) closeDropdown(session);
    },
    true,
  );
}
