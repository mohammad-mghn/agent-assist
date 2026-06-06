import type { UiLocale } from '@/shared/types';

export interface LocaleConfig {
  code: UiLocale;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
}

export const DEFAULT_UI_LOCALE: UiLocale = 'en-US';

export const UI_LOCALES: LocaleConfig[] = [
  {
    code: 'en-US',
    label: 'English (US)',
    nativeLabel: 'English (US)',
    dir: 'ltr',
  },
  {
    code: 'en-GB',
    label: 'English (UK)',
    nativeLabel: 'English (UK)',
    dir: 'ltr',
  },
  {
    code: 'fa',
    label: 'Persian',
    nativeLabel: 'فارسی',
    dir: 'rtl',
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
  },
  {
    code: 'tr',
    label: 'Turkish',
    nativeLabel: 'Türkçe',
    dir: 'ltr',
  },
  {
    code: 'ku',
    label: 'Kurdish',
    nativeLabel: 'کوردی',
    dir: 'rtl',
  },
];

export const UI_LOCALE_CODES = UI_LOCALES.map((item) => item.code);

export function getLocaleConfig(locale: UiLocale): LocaleConfig {
  return UI_LOCALES.find((item) => item.code === locale) ?? UI_LOCALES[0]!;
}
