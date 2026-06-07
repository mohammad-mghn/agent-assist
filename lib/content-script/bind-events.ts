import { tryAdvanceJumpStopInElement } from '@/lib/jump-stop';
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
import {
  isSnippetAssistDocument,
  markSnippetAssistDocument,
  observeSnippetAssistFrames,
} from '@/lib/content-script/frame-bridge';
import { resolveEligibleElement, getDeepActiveElement } from '@/lib/insert-text';

const EDITOR_ACTIVITY_EVENTS = ['input', 'beforeinput', 'keyup'] as const;

function isTypingKey(e: KeyboardEvent): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}

function bindDocumentEvents(
  session: SnippetAssistSession,
  root: Document | ShadowRoot,
): void {
  const onEditorActivity = (e: Event) => {
    const el = resolveEligibleElement(e.target, e.composedPath());
    if (!el) return;
    updateDropdown(session, el);
  };

  for (const type of EDITOR_ACTIVITY_EVENTS) {
    root.addEventListener(type, onEditorActivity, true);
  }

  root.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
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
        tryJumpStopAdvance: () => tryAdvanceJumpStopInElement(el),
        onTriggerTyped: () => queueMicrotask(() => updateDropdown(session, el)),
      });

      if (isTypingKey(e)) {
        queueMicrotask(() => updateDropdown(session, el));
      }
    },
    true,
  );

  root.addEventListener(
    'click',
    (e) => {
      if (!session.open) return;
      if (!isSnippetDropdownEvent(e.composedPath())) closeDropdown(session);
    },
    true,
  );

  root.addEventListener(
    'scroll',
    () => {
      if (!session.open || !session.activeElement) return;
      if (!session.activeElement.isConnected) {
        closeDropdown(session);
        return;
      }
      updateDropdown(session, session.activeElement);
    },
    true,
  );

  root.addEventListener(
    'focusout',
    () => {
      if (!session.open || !session.activeElement) return;
      queueMicrotask(() => {
        if (!session.open) return;
        const current = resolveEligibleElement(getDeepActiveElement());
        if (current !== session.activeElement) closeDropdown(session);
      });
    },
    true,
  );
}

export function bindSnippetAssistEvents(session: SnippetAssistSession): void {
  if (isSnippetAssistDocument(document)) return;

  markSnippetAssistDocument(document);
  bindDocumentEvents(session, document);

  observeSnippetAssistFrames((doc) => {
    bindDocumentEvents(session, doc);
  });
}
