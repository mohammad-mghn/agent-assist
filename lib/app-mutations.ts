import { TEMP_CATEGORY_ID } from '../shared/constants';
import type { AppData, Category, Shortcut, ShortcutKind } from '../shared/types';
import { generateId } from './utils';

export function upsertShortcut(
  data: AppData,
  shortcut: Omit<Shortcut, 'id'> & { id?: string },
): AppData {
  const id = shortcut.id ?? generateId();
  const next: Shortcut = {
    id,
    name: shortcut.name,
    shortcut: shortcut.shortcut,
    content: shortcut.content,
    categoryId: shortcut.categoryId,
    kind: shortcut.kind,
  };
  const exists = data.shortcuts.findIndex((s) => s.id === id);
  const shortcuts =
    exists >= 0
      ? data.shortcuts.map((s, i) => (i === exists ? next : s))
      : [...data.shortcuts, next];
  return { ...data, shortcuts };
}

export function deleteShortcut(data: AppData, id: string): AppData {
  return {
    ...data,
    shortcuts: data.shortcuts.filter((s) => s.id !== id),
  };
}

export function deleteCategory(data: AppData, categoryId: string): AppData {
  if (categoryId === TEMP_CATEGORY_ID) {
    return {
      ...data,
      shortcuts: data.shortcuts.filter((s) => s.kind !== 'temp'),
    };
  }
  return {
    ...data,
    categories: data.categories.filter((c) => c.id !== categoryId),
    shortcuts: data.shortcuts.filter((s) => s.categoryId !== categoryId),
  };
}

export function addCategory(
  data: AppData,
  category: Omit<Category, 'id'> & { id?: string },
): { data: AppData; category: Category } {
  const cat: Category = {
    id: category.id ?? generateId(),
    name: category.name,
    color: category.color,
  };
  return {
    data: { ...data, categories: [...data.categories, cat] },
    category: cat,
  };
}

export function importPermanent(
  data: AppData,
  categories: Category[],
  shortcuts: Shortcut[],
  overwrite: boolean,
): AppData {
  const tempShortcuts = data.shortcuts.filter((s) => s.kind === 'temp');
  const tempCategory = data.categories.find((c) => c.id === TEMP_CATEGORY_ID)!;
  const incomingCategories = categories.filter((c) => c.id !== TEMP_CATEGORY_ID);
  const incomingShortcuts = shortcuts.filter((s) => s.kind === 'permanent');

  if (overwrite) {
    return {
      ...data,
      categories: [tempCategory, ...incomingCategories],
      shortcuts: [...tempShortcuts, ...incomingShortcuts],
    };
  }
  return {
    ...data,
    categories: [
      tempCategory,
      ...data.categories.filter((c) => c.id !== TEMP_CATEGORY_ID),
      ...incomingCategories,
    ],
    shortcuts: [...data.shortcuts, ...incomingShortcuts],
  };
}

export function importTemp(
  data: AppData,
  shortcuts: Shortcut[],
  overwrite: boolean,
): AppData {
  const permanent = data.shortcuts.filter((s) => s.kind === 'permanent');
  const normalized = shortcuts.map((s) => ({
    ...s,
    kind: 'temp' as ShortcutKind,
    categoryId: TEMP_CATEGORY_ID,
  }));

  if (overwrite) {
    return { ...data, shortcuts: [...permanent, ...normalized] };
  }
  return { ...data, shortcuts: [...data.shortcuts, ...normalized] };
}
