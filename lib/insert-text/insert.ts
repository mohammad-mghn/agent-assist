import { focusFirstJumpStopInElement } from '@/lib/jump-stop';
import type { TriggerChar } from '@/shared/types';
import { replaceContentEditableTrigger } from './contenteditable';
import {
  isContentEditableTarget,
  isMultilineElement,
  normalizeContent,
} from './eligible';
import { getContentEditableTrigger, getTextareaTrigger } from './trigger';
import { replaceTextareaTrigger } from './textarea';

export function insertIntoElement(
  el: HTMLElement,
  trigger: TriggerChar,
  query: string,
  content: string,
): boolean {
  const multiline = isMultilineElement(el);
  const normalized = normalizeContent(content, multiline);

  if (el.tagName === 'TEXTAREA') {
    const textarea = el as HTMLTextAreaElement;
    const state = getTextareaTrigger(textarea);
    if (!state || state.trigger !== trigger) return false;
    const end = textarea.selectionStart ?? 0;
    replaceTextareaTrigger(textarea, state.start, end, normalized);
    queueMicrotask(() => {
      focusFirstJumpStopInElement(textarea);
    });
    return true;
  }

  if (isContentEditableTarget(el)) {
    const state = getContentEditableTrigger(el);
    if (!state || state.trigger !== trigger) return false;
    const token = `${trigger}${query}`;
    replaceContentEditableTrigger(el, token, normalized);
    queueMicrotask(() => {
      focusFirstJumpStopInElement(el);
    });
    return true;
  }

  return false;
}
