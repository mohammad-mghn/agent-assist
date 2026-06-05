import type { TriggerChar } from '@/shared/types';
import { replaceContentEditableTrigger } from './contenteditable';
import {
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

  if (el instanceof HTMLTextAreaElement) {
    const state = getTextareaTrigger(el);
    if (!state || state.trigger !== trigger) return false;
    const end = el.selectionStart ?? 0;
    replaceTextareaTrigger(el, state.start, end, normalized);
    return true;
  }

  if (el.isContentEditable) {
    const state = getContentEditableTrigger(el);
    if (!state || state.trigger !== trigger) return false;
    const token = `${trigger}${query}`;
    replaceContentEditableTrigger(el, token, normalized);
    return true;
  }

  return false;
}
