import { createDefaultAppData } from '@/lib/default-data';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { AppData, Category, Shortcut } from '@/shared/types';

export function makeCategory(
  overrides: Partial<Category> & Pick<Category, 'id' | 'name'>,
): Category {
  return {
    color: '#3b82f6',
    ...overrides,
  };
}

export function makeShortcut(
  overrides: Partial<Shortcut> & Pick<Shortcut, 'id' | 'name' | 'shortcut' | 'content'>,
): Shortcut {
  return {
    categoryId: 'cat-support',
    kind: 'permanent',
    ...overrides,
  };
}

export function createSampleAppData(): AppData {
  const base = createDefaultAppData();
  const support = makeCategory({ id: 'cat-support', name: 'Support' });
  const sales = makeCategory({ id: 'cat-sales', name: 'Sales', color: '#22c55e' });

  return {
    ...base,
    categories: [
      base.categories.find((c) => c.id === TEMP_CATEGORY_ID)!,
      support,
      sales,
    ],
    shortcuts: [
      makeShortcut({
        id: 'sc-reply',
        name: 'Reply',
        shortcut: 'reply',
        content: 'Thank you for contacting support.',
        categoryId: support.id,
        kind: 'permanent',
      }),
      makeShortcut({
        id: 'sc-offer',
        name: 'Offer',
        shortcut: 'offer',
        content: 'Here is our latest offer.',
        categoryId: sales.id,
        kind: 'permanent',
      }),
      makeShortcut({
        id: 'sc-note',
        name: 'Quick note',
        shortcut: 'note',
        content: 'Follow up tomorrow.',
        categoryId: TEMP_CATEGORY_ID,
        kind: 'temp',
      }),
    ],
  };
}

export function createPermanentExportPayload() {
  return {
    version: 1 as const,
    type: 'permanent' as const,
    categories: [
      { id: 'cat-imported', name: 'Imported' },
    ],
    shortcuts: [
      {
        id: 'sc-imported',
        name: 'Imported reply',
        shortcut: 'imported',
        content: 'Imported content.',
        categoryId: 'cat-imported',
        kind: 'permanent' as const,
      },
    ],
  };
}

export function createTempExportPayload() {
  return {
    version: 1 as const,
    type: 'temp' as const,
    shortcuts: [
      {
        id: 'sc-temp-import',
        name: 'Temp import',
        shortcut: 'tempimp',
        content: 'Temporary imported snippet.',
        categoryId: TEMP_CATEGORY_ID,
        kind: 'temp' as const,
      },
    ],
  };
}
