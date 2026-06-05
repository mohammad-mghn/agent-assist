import {
  MESSAGE_THEME_CHANGED,
  STORAGE_KEY_UI_THEME,
} from '@/shared/constants';
import type { UiTheme } from '@/shared/types';
import { broadcastToTabs } from './broadcast';

export function normalizeUiTheme(value: unknown): UiTheme {
  return value === 'dark' ? 'dark' : 'light';
}

export async function loadUiTheme(): Promise<UiTheme> {
  const result = await browser.storage.local.get(STORAGE_KEY_UI_THEME);
  return normalizeUiTheme(result[STORAGE_KEY_UI_THEME]);
}

export async function saveUiTheme(theme: UiTheme): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY_UI_THEME]: theme });
}

export function applyUiThemeToDocument(theme: UiTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export async function broadcastUiThemeChanged(theme: UiTheme): Promise<void> {
  await broadcastToTabs({ type: MESSAGE_THEME_CHANGED, theme });
}

export function onUiThemeChanged(
  callback: (theme: UiTheme) => void,
): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    area: string,
  ) => {
    if (area !== 'local') return;
    if (changes[STORAGE_KEY_UI_THEME]) {
      callback(normalizeUiTheme(changes[STORAGE_KEY_UI_THEME].newValue));
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
