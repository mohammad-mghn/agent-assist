import type { CATEGORY_COLORS } from './constants';

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type ShortcutKind = 'permanent' | 'temp';

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
}

export interface ExportCategory {
  id: string;
  name: string;
}

export interface Shortcut {
  id: string;
  name: string;
  shortcut: string;
  content: string;
  categoryId: string;
  kind: ShortcutKind;
}

export interface AppData {
  version: 1;
  enabled: boolean;
  dropdownEnabled: boolean;
  savedDropdownEnabled: boolean;
  categories: Category[];
  shortcuts: Shortcut[];
}

export interface SyncMeta {
  version: 1;
  enabled: boolean;
  dropdownEnabled: boolean;
  savedDropdownEnabled: boolean;
  categories: Category[];
  shortcutMeta: Array<{
    id: string;
    name: string;
    shortcut: string;
    categoryId: string;
    kind: ShortcutKind;
  }>;
}

export interface PermanentExport {
  version: 1;
  type: 'permanent';
  categories: ExportCategory[];
  shortcuts: Shortcut[];
}

export interface TempExport {
  version: 1;
  type: 'temp';
  shortcuts: Shortcut[];
}

export type TriggerChar = '/' | '#';

export type UiTheme = 'light' | 'dark';

export type UiLocale = 'en-US' | 'en-GB' | 'fa' | 'ar' | 'tr' | 'ku';
