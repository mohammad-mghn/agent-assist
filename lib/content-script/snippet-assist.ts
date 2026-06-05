import { bindSnippetAssistEvents } from '@/lib/content-script/bind-events';
import {
  closeDropdown,
  createSnippetAssistSession,
} from '@/lib/content-script/dropdown-session';
import { translate } from '@/lib/i18n/translations';
import { readAppDataCached } from '@/lib/storage-read';
import { loadUiLocale, normalizeUiLocale } from '@/lib/ui-locale';
import { loadUiTheme, normalizeUiTheme, onUiThemeChanged } from '@/lib/ui-theme';
import {
  MESSAGE_DATA_CHANGED,
  MESSAGE_LOCALE_CHANGED,
  MESSAGE_THEME_CHANGED,
} from '@/shared/constants';

export function initSnippetAssistContentScript(): void {
  const session = createSnippetAssistSession();

  const refresh = async () => {
    session.appData = await readAppDataCached();
    session.extensionEnabled = session.appData.enabled;
    session.dropdownEnabled = session.appData.dropdownEnabled ?? true;
    if (!session.extensionEnabled || !session.dropdownEnabled) closeDropdown(session);
  };

  const refreshTheme = async () => {
    session.uiTheme = await loadUiTheme();
    session.dropdown?.setTheme(session.uiTheme);
  };

  const refreshLocale = async () => {
    session.uiLocale = await loadUiLocale();
    session.dropdown?.setEmptyLabel(translate(session.uiLocale, 'dropdown.noMatches'));
  };

  void refresh();
  void refreshTheme();
  void refreshLocale();

  onUiThemeChanged((theme) => {
    session.uiTheme = theme;
    session.dropdown?.setTheme(theme);
  });

  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === MESSAGE_DATA_CHANGED) void refresh();
    if (msg?.type === MESSAGE_THEME_CHANGED) {
      session.uiTheme = normalizeUiTheme(msg.theme);
      session.dropdown?.setTheme(session.uiTheme);
    }
    if (msg?.type === MESSAGE_LOCALE_CHANGED) {
      session.uiLocale = normalizeUiLocale(msg.locale);
      session.dropdown?.setEmptyLabel(translate(session.uiLocale, 'dropdown.noMatches'));
    }
  });

  bindSnippetAssistEvents(session);
}
