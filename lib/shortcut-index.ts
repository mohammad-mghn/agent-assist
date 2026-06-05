import { TEMP_CATEGORY_ID } from '../shared/constants';
import type { AppData, Category, Shortcut, TriggerChar } from '../shared/types';

export interface DropdownItem {
  shortcut: Shortcut;
  category: Category;
  trigger: TriggerChar;
  query: string;
}

export function triggerForKind(kind: Shortcut['kind']): TriggerChar {
  return kind === 'temp' ? '#' : '/';
}

export function filterShortcuts(
  data: AppData,
  trigger: TriggerChar,
  query: string,
): DropdownItem[] {
  const q = query.toLowerCase();
  const items: DropdownItem[] = [];

  for (const shortcut of data.shortcuts) {
    const t = triggerForKind(shortcut.kind);
    if (t !== trigger) continue;
    if (q && !shortcut.shortcut.toLowerCase().startsWith(q)) continue;

    const category =
      data.categories.find((c) => c.id === shortcut.categoryId) ??
      data.categories.find((c) => c.id === TEMP_CATEGORY_ID)!;

    items.push({ shortcut, category, trigger: t, query: q });
  }

  items.sort((a, b) => a.shortcut.name.localeCompare(b.shortcut.name));
  return items;
}

export function findExactShortcut(
  data: AppData,
  trigger: TriggerChar,
  token: string,
): Shortcut | undefined {
  const normalized = token.toLowerCase();
  return data.shortcuts.find(
    (s) =>
      triggerForKind(s.kind) === trigger &&
      s.shortcut.toLowerCase() === normalized,
  );
}

export function findDuplicateShortcut(
  data: AppData,
  shortcut: string,
  kind: Shortcut['kind'],
  excludeId?: string,
): Shortcut | undefined {
  const normalized = shortcut.toLowerCase();
  return data.shortcuts.find(
    (s) =>
      s.kind === kind &&
      s.id !== excludeId &&
      s.shortcut.toLowerCase() === normalized,
  );
}

export function getPermanentShortcuts(data: AppData): Shortcut[] {
  return data.shortcuts.filter((s) => s.kind === 'permanent');
}

export function getTempShortcuts(data: AppData): Shortcut[] {
  return data.shortcuts.filter((s) => s.kind === 'temp');
}

export function getCategoriesForSidebar(data: AppData): Category[] {
  return data.categories.filter((c) => c.id !== TEMP_CATEGORY_ID);
}
