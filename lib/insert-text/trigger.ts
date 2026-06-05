import type { TriggerChar } from '@/shared/types';
import { TRIGGER_TOKEN_RE } from './constants';

export interface TriggerState {
  trigger: TriggerChar;
  start: number;
  query: string;
}

export function getTextareaTrigger(
  el: HTMLTextAreaElement,
): TriggerState | null {
  const pos = el.selectionStart ?? 0;
  const text = el.value.slice(0, pos);
  const match = text.match(TRIGGER_TOKEN_RE);
  if (!match || match.index === undefined) return null;
  const trigger = match[1] as TriggerChar;
  const query = match[2] ?? '';
  const start = text.length - query.length - 1;
  return { trigger, start, query };
}

function getContentEditableTextBeforeCaret(el: HTMLElement): {
  text: string;
  range: Range;
} | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  return { text: preRange.toString(), range };
}

export function getContentEditableTrigger(
  el: HTMLElement,
): (TriggerState & { range: Range }) | null {
  const info = getContentEditableTextBeforeCaret(el);
  if (!info) return null;
  const match = info.text.match(TRIGGER_TOKEN_RE);
  if (!match) return null;
  const trigger = match[1] as TriggerChar;
  const query = match[2] ?? '';
  const tokenLen = query.length + 1;
  const start = info.text.length - tokenLen;
  return { trigger, start, query, range: info.range };
}
