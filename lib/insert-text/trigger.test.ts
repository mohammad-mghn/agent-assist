import { describe, expect, it } from 'vitest';
import { getTextareaTrigger } from '@/lib/insert-text/trigger';

function createTextarea(value: string, selectionStart: number): HTMLTextAreaElement {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionStart;
  document.body.appendChild(textarea);
  return textarea;
}

describe('getTextareaTrigger', () => {
  it('detects slash trigger with empty query', () => {
    const el = createTextarea('Hello /', 7);
    expect(getTextareaTrigger(el)).toEqual({
      trigger: '/',
      start: 6,
      query: '',
    });
    el.remove();
  });

  it('detects hash trigger with partial query', () => {
    const el = createTextarea('Note #no', 8);
    expect(getTextareaTrigger(el)).toEqual({
      trigger: '#',
      start: 5,
      query: 'no',
    });
    el.remove();
  });

  it('detects trigger after whitespace', () => {
    const el = createTextarea('start /rep', 10);
    expect(getTextareaTrigger(el)?.query).toBe('rep');
    el.remove();
  });

  it('returns null when caret is not after a trigger token', () => {
    const el = createTextarea('plain text', 10);
    expect(getTextareaTrigger(el)).toBeNull();
    el.remove();
  });

  it('supports unicode shortcut queries', () => {
    const el = createTextarea('/پاسخ', 5);
    expect(getTextareaTrigger(el)?.query).toBe('پاسخ');
    el.remove();
  });
});
