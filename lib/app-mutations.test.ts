import { describe, expect, it } from 'vitest';
import {
  addCategory,
  deleteCategory,
  deleteShortcut,
  importPermanent,
  importTemp,
  updateCategory,
  upsertShortcut,
} from '@/lib/app-mutations';
import { createSampleAppData, makeCategory, makeShortcut } from '@/test/fixtures/app-data';
import { TEMP_CATEGORY_ID } from '@/shared/constants';

describe('app-mutations', () => {
  const data = createSampleAppData();

  it('upserts and deletes shortcuts', () => {
    const created = upsertShortcut(data, {
      name: 'New',
      shortcut: 'new',
      content: 'Body',
      categoryId: 'cat-support',
      kind: 'permanent',
    });
    expect(created.shortcuts.some((s) => s.shortcut === 'new')).toBe(true);

    const updated = upsertShortcut(created, {
      id: created.shortcuts.find((s) => s.shortcut === 'new')!.id,
      name: 'Renamed',
      shortcut: 'new',
      content: 'Updated body',
      categoryId: 'cat-support',
      kind: 'permanent',
    });
    expect(updated.shortcuts.find((s) => s.shortcut === 'new')?.content).toBe('Updated body');

    const deleted = deleteShortcut(updated, updated.shortcuts.find((s) => s.shortcut === 'new')!.id);
    expect(deleted.shortcuts.some((s) => s.shortcut === 'new')).toBe(false);
  });

  it('adds and updates categories', () => {
    const { data: withCategory, category } = addCategory(data, {
      name: 'Billing',
      color: '#ef4444',
    });
    expect(withCategory.categories.some((c) => c.id === category.id)).toBe(true);

    const updated = updateCategory(withCategory, category.id, {
      name: 'Billing updated',
      color: '#22c55e',
    });
    expect(updated.categories.find((c) => c.id === category.id)?.name).toBe('Billing updated');
  });

  it('deletes non-temp categories and their shortcuts', () => {
    const next = deleteCategory(data, 'cat-support');
    expect(next.categories.some((c) => c.id === 'cat-support')).toBe(false);
    expect(next.shortcuts.some((s) => s.categoryId === 'cat-support')).toBe(false);
    expect(next.shortcuts.some((s) => s.kind === 'temp')).toBe(true);
  });

  it('clears temp shortcuts when deleting temp category', () => {
    const next = deleteCategory(data, TEMP_CATEGORY_ID);
    expect(next.shortcuts.some((s) => s.kind === 'temp')).toBe(false);
    expect(next.shortcuts.some((s) => s.kind === 'permanent')).toBe(true);
  });

  describe('importPermanent', () => {
    const incomingCategories = [
      makeCategory({ id: 'cat-new', name: 'Imported', color: '#6366f1' }),
    ];
    const incomingShortcuts = [
      makeShortcut({
        id: 'sc-new',
        name: 'Imported',
        shortcut: 'imported',
        content: 'Imported text',
        categoryId: 'cat-new',
        kind: 'permanent',
      }),
    ];

    it('merges incoming data without overwrite', () => {
      const next = importPermanent(data, incomingCategories, incomingShortcuts, false);
      expect(next.categories.some((c) => c.id === 'cat-new')).toBe(true);
      expect(next.categories.some((c) => c.id === 'cat-support')).toBe(true);
      expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(3);
      expect(next.shortcuts.some((s) => s.kind === 'temp')).toBe(true);
    });

    it('replaces permanent data on overwrite while preserving temp shortcuts', () => {
      const next = importPermanent(data, incomingCategories, incomingShortcuts, true);
      expect(next.categories.filter((c) => c.id !== TEMP_CATEGORY_ID)).toHaveLength(1);
      expect(next.categories[0]?.id).toBe(TEMP_CATEGORY_ID);
      expect(next.categories[1]?.id).toBe('cat-new');
      expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(1);
      expect(next.shortcuts.some((s) => s.kind === 'temp')).toBe(true);
    });
  });

  describe('importTemp', () => {
    const incoming = [
      makeShortcut({
        id: 'sc-temp-new',
        name: 'Imported temp',
        shortcut: 'tempnew',
        content: 'Temp body',
        categoryId: 'wrong-id',
        kind: 'temp',
      }),
    ];

    it('merges temp shortcuts without overwrite', () => {
      const next = importTemp(data, incoming, false);
      expect(next.shortcuts.filter((s) => s.kind === 'temp')).toHaveLength(2);
      expect(next.shortcuts.find((s) => s.shortcut === 'tempnew')?.categoryId).toBe(
        TEMP_CATEGORY_ID,
      );
    });

    it('replaces temp shortcuts on overwrite while preserving permanent shortcuts', () => {
      const next = importTemp(data, incoming, true);
      expect(next.shortcuts.filter((s) => s.kind === 'temp')).toHaveLength(1);
      expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(2);
    });
  });
});
