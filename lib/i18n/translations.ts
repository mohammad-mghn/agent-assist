import type { UiLocale } from '@/shared/types';
import type { TranslationKey, TranslationMap, TranslateParams } from '@/lib/i18n/types';
import { enUS } from '@/lib/i18n/messages/en-US';
import { enGB } from '@/lib/i18n/messages/en-GB';
import { fa } from '@/lib/i18n/messages/fa';
import { ar } from '@/lib/i18n/messages/ar';
import { tr } from '@/lib/i18n/messages/tr';
import { ku } from '@/lib/i18n/messages/ku';

export type { TranslationKey, TranslationMap, TranslateParams } from '@/lib/i18n/types';

export const translations: Record<UiLocale, TranslationMap> = {
  'en-US': enUS,
  'en-GB': enGB,
  fa,
  ar,
  tr,
  ku,
};

export function translate(
  locale: UiLocale,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const template =
    translations[locale][key] ?? translations['en-US'][key] ?? key;
  if (!params) return template;

  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}
