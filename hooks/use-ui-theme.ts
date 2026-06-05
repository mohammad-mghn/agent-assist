import { useCallback, useEffect, useState } from 'react';
import {
  applyUiThemeToDocument,
  broadcastUiThemeChanged,
  loadUiTheme,
  onUiThemeChanged,
  saveUiTheme,
} from '@/lib/ui-theme';
import type { UiTheme } from '@/shared/types';

export function useUiTheme() {
  const [theme, setTheme] = useState<UiTheme>('light');

  useEffect(() => {
    void loadUiTheme().then((t) => {
      setTheme(t);
      applyUiThemeToDocument(t);
    });
    return onUiThemeChanged((t) => {
      setTheme(t);
      applyUiThemeToDocument(t);
    });
  }, []);

  const setUiTheme = useCallback(async (next: UiTheme) => {
    await saveUiTheme(next);
    applyUiThemeToDocument(next);
    setTheme(next);
    await broadcastUiThemeChanged(next);
  }, []);

  return { theme, setUiTheme };
}
