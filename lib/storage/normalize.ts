import {
  DEFAULT_CATEGORY_COLOR,
  STORAGE_KEY_SYNC_META,
  TEMP_CATEGORY_ID,
  TEMP_CATEGORY_NAME,
} from '@/shared/constants';
import type { AppData, SyncMeta } from '@/shared/types';

export function buildSyncMeta(data: AppData): SyncMeta {
  return {
    version: 1,
    enabled: data.enabled,
    dropdownEnabled: data.dropdownEnabled,
    savedDropdownEnabled: data.savedDropdownEnabled,
    categories: data.categories,
    shortcutMeta: data.shortcuts.map((s) => ({
      id: s.id,
      name: s.name,
      shortcut: s.shortcut,
      categoryId: s.categoryId,
      kind: s.kind,
    })),
  };
}

export async function writeSyncMeta(data: AppData): Promise<void> {
  const meta = buildSyncMeta(data);
  try {
    await browser.storage.sync.set({
      [STORAGE_KEY_SYNC_META]: meta,
      enabled: data.enabled,
    });
  } catch {
    return;
  }
}

const SEED_CATEGORY_NAMES = new Set(['Work', 'Personal']);

function stripSeedCategories(data: AppData): AppData {
  const removeIds = data.categories
    .filter(
      (c) =>
        c.id !== TEMP_CATEGORY_ID && SEED_CATEGORY_NAMES.has(c.name),
    )
    .filter((c) => !data.shortcuts.some((s) => s.categoryId === c.id))
    .map((c) => c.id);

  if (removeIds.length === 0) return data;

  return {
    ...data,
    categories: data.categories.filter((c) => !removeIds.includes(c.id)),
  };
}

export function ensureTempCategory(data: AppData): AppData {
  const withDefaults: AppData = {
    ...data,
    dropdownEnabled: data.dropdownEnabled ?? true,
    savedDropdownEnabled:
      data.savedDropdownEnabled ?? data.dropdownEnabled ?? true,
  };

  const withTemp = (() => {
    const hasTemp = withDefaults.categories.some((c) => c.id === TEMP_CATEGORY_ID);
    if (hasTemp) return withDefaults;

    return {
      ...withDefaults,
      categories: [
        {
          id: TEMP_CATEGORY_ID,
          name: TEMP_CATEGORY_NAME,
          color: DEFAULT_CATEGORY_COLOR,
        },
        ...withDefaults.categories,
      ],
    };
  })();

  return stripSeedCategories(withTemp);
}
