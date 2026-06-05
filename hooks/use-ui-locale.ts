import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLocaleConfig } from '@/lib/i18n/locales';
import {
  translate,
  type TranslationKey,
  type TranslateParams,
} from '@/lib/i18n/translations';
import {
  applyUiLocaleToDocument,
  broadcastUiLocaleChanged,
  loadUiLocale,
  onUiLocaleChanged,
  saveUiLocale,
} from '@/lib/ui-locale';
import type { UiLocale } from '@/shared/types';

export function useUiLocale() {
  const [locale, setLocale] = useState<UiLocale>('en-US');

  useEffect(() => {
    void loadUiLocale().then((next) => {
      setLocale(next);
      applyUiLocaleToDocument(next);
    });
    return onUiLocaleChanged((next) => {
      setLocale(next);
      applyUiLocaleToDocument(next);
    });
  }, []);

  const setUiLocale = useCallback(async (next: UiLocale) => {
    await saveUiLocale(next);
    applyUiLocaleToDocument(next);
    setLocale(next);
    await broadcastUiLocaleChanged(next);
  }, []);

  const config = useMemo(() => getLocaleConfig(locale), [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) =>
      translate(locale, key, params),
    [locale],
  );

  return {
    locale,
    setUiLocale,
    t,
    dir: config.dir,
  };
}
