export const APP_VERSION = 1 as const;

export const TEMP_CATEGORY_ID = 'temp-category';

export const TEMP_CATEGORY_NAME = 'Temporary';

export const SHORTCUT_KINDS = ['permanent', 'temp'] as const;

export const CATEGORY_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
] as const;

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[10];

export function randomCategoryColor(): (typeof CATEGORY_COLORS)[number] {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
}

export const STORAGE_KEY_LOCAL = 'snippetAssistData';

export const STORAGE_KEY_SYNC_META = 'snippetAssistSyncMeta';

export const STORAGE_KEY_UI_THEME = 'snippetAssistUiTheme';

export const STORAGE_KEY_UI_LOCALE = 'snippetAssistUiLocale';

export const MESSAGE_DATA_CHANGED = 'DATA_CHANGED';

export const MESSAGE_THEME_CHANGED = 'THEME_CHANGED';

export const MESSAGE_LOCALE_CHANGED = 'LOCALE_CHANGED';

export const MESSAGE_ICON_UPDATE = 'ICON_UPDATE';

export const CONTENT_TRUNCATE_LEN = 60;

export const MAX_DROPDOWN_ITEMS = 9;
