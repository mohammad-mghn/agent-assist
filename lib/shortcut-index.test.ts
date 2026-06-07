import { describe, expect, it } from 'vitest';
import { createSampleAppData } from '@/test/fixtures/app-data';
import {
  dedupeImportedShortcuts,
  filterShortcuts,
  findDuplicateShortcut,
  findExactShortcut,
  getPermanentShortcuts,
  getTempShortcuts,
  triggerForKind,
} from '@/lib/shortcut-index';
import { makeShortcut } from '@/test/fixtures/app-data';

describe('shortcut-index', () => {
  const data = createSampleAppData();

  it('maps shortcut kinds to trigger characters', () => {
    expect(triggerForKind('permanent')).toBe('/');
    expect(triggerForKind('temp')).toBe('#');
  });

  it('filters permanent shortcuts by / trigger and prefix', () => {
    const items = filterShortcuts(data, '/', 're');
    expect(items).toHaveLength(1);
    expect(items[0]?.shortcut.shortcut).toBe('reply');
  });

  it('filters temp shortcuts by # trigger', () => {
    const items = filterShortcuts(data, '#', 'no');
    expect(items).toHaveLength(1);
    expect(items[0]?.shortcut.kind).toBe('temp');
  });

  it('returns all shortcuts for empty query', () => {
    const permanent = filterShortcuts(data, '/', '');
    const temp = filterShortcuts(data, '#', '');
    expect(permanent.every((item) => item.shortcut.kind === 'permanent')).toBe(true);
    expect(temp.every((item) => item.shortcut.kind === 'temp')).toBe(true);
  });

  it('finds exact shortcuts case-insensitively', () => {
    expect(findExactShortcut(data, '/', 'REPLY')?.id).toBe('sc-reply');
    expect(findExactShortcut(data, '#', 'NOTE')?.id).toBe('sc-note');
    expect(findExactShortcut(data, '/', 'missing')).toBeUndefined();
  });

  it('detects duplicate shortcuts within the same kind', () => {
    expect(findDuplicateShortcut(data, 'reply', 'permanent')?.id).toBe('sc-reply');
    expect(findDuplicateShortcut(data, 'reply', 'permanent', 'sc-reply')).toBeUndefined();
    expect(findDuplicateShortcut(data, 'reply', 'temp')).toBeUndefined();
  });

  it('splits permanent and temp shortcut lists', () => {
    expect(getPermanentShortcuts(data)).toHaveLength(2);
    expect(getTempShortcuts(data)).toHaveLength(1);
  });

  it('dedupes imported shortcuts with letter suffixes instead of numbers', () => {
    const incoming = [
      makeShortcut({ id: 'a', name: 'First', shortcut: 'reply', content: 'A' }),
      makeShortcut({ id: 'b', name: 'Second', shortcut: 'reply', content: 'B' }),
      makeShortcut({ id: 'c', name: 'Third', shortcut: 'reply', content: 'C' }),
    ];
    const deduped = dedupeImportedShortcuts(incoming);
    expect(deduped.map((s) => s.shortcut)).toEqual(['reply', 'reply-a', 'reply-b']);
  });

  it('dedupes against existing shortcuts of the same kind only', () => {
    const existing = [
      makeShortcut({ id: 'x', name: 'Existing', shortcut: 'reply', content: 'X' }),
      makeShortcut({
        id: 'y',
        name: 'Temp reply',
        shortcut: 'reply',
        content: 'Y',
        kind: 'temp',
        categoryId: 'temp-category',
      }),
    ];
    const incoming = [
      makeShortcut({ id: 'a', name: 'Incoming', shortcut: 'reply', content: 'A' }),
      makeShortcut({
        id: 'b',
        name: 'Incoming temp',
        shortcut: 'reply',
        content: 'B',
        kind: 'temp',
        categoryId: 'temp-category',
      }),
    ];
    const deduped = dedupeImportedShortcuts(incoming, existing);
    expect(deduped[0]?.shortcut).toBe('reply-a');
    expect(deduped[1]?.shortcut).toBe('reply-a');
  });
});
