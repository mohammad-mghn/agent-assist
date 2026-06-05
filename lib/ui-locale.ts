import {
  STORAGE_KEY_UI_LOCALE,
  MESSAGE_LOCALE_CHANGED,
} from '@/shared/constants';
import type { UiLocale } from '@/shared/types';
import {
  DEFAULT_UI_LOCALE,
  getLocaleConfig,
  UI_LOCALE_CODES,
} from '@/lib/i18n/locales';
import { broadcastToTabs } from './broadcast';

const LEGACY_LOCALE_MAP: Record<string, UiLocale> = {
  en: 'en-US',
  nl: 'en-US',
  he: 'en-US',
};

export function normalizeUiLocale(value: unknown): UiLocale {
  if (typeof value === 'string') {
    if (UI_LOCALE_CODES.includes(value as UiLocale)) {
      return value as UiLocale;
    }
    const legacy = LEGACY_LOCALE_MAP[value];
    if (legacy) return legacy;
  }
  return DEFAULT_UI_LOCALE;
}

export async function loadUiLocale(): Promise<UiLocale> {
  const result = await browser.storage.local.get(STORAGE_KEY_UI_LOCALE);
  return normalizeUiLocale(result[STORAGE_KEY_UI_LOCALE]);
}

export async function saveUiLocale(locale: UiLocale): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY_UI_LOCALE]: locale });
}

export function applyUiLocaleToDocument(locale: UiLocale): void {
  const root = document.documentElement;
  const { dir } = getLocaleConfig(locale);
  root.lang = locale;
  root.dir = dir;
}

export async function broadcastUiLocaleChanged(locale: UiLocale): Promise<void> {
  await broadcastToTabs({ type: MESSAGE_LOCALE_CHANGED, locale });
}

export function onUiLocaleChanged(
  callback: (locale: UiLocale) => void,
): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    area: string,
  ) => {
    if (area !== 'local') return;
    if (changes[STORAGE_KEY_UI_LOCALE]) {
      callback(normalizeUiLocale(changes[STORAGE_KEY_UI_LOCALE].newValue));
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
