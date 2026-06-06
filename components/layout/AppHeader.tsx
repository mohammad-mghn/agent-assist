import logoSrc from '@/assets/logo/83508a0089a0476cb7db285b953eaf6e.png';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { UiLocale, UiTheme } from '@/shared/types';

interface AppHeaderProps {
  extensionEnabled: boolean;
  theme: UiTheme;
  onThemeChange: (theme: UiTheme) => void;
  onLocaleChange: (locale: UiLocale) => void;
}

export function AppHeader({
  extensionEnabled,
  theme,
  onThemeChange,
  onLocaleChange,
}: AppHeaderProps) {
  const { locale, t } = useUiLocale();
  const statusLabel = extensionEnabled
    ? t('app.extensionActive')
    : t('app.extensionDisabled');

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[var(--color-border)] px-[var(--layout-header-px)] py-3 xl:py-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <img
          src={logoSrc}
          alt=""
          className="h-7 w-7 shrink-0 rounded-sm object-contain xl:h-8 xl:w-8"
          aria-hidden
        />
        <h1 className="min-w-0 truncate text-lg font-bold tracking-tight xl:text-xl">
          {t('app.title')}
        </h1>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 lg:gap-3">
        <div
          className="me-auto flex min-w-0 items-center gap-2 text-sm"
          title={statusLabel}
        >
          <span
            className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${extensionEnabled ? 'bg-emerald-500' : 'bg-red-500'}`}
            aria-hidden
          />
          <span className="hidden max-w-[12rem] truncate text-[var(--color-muted-foreground)] lg:inline xl:max-w-none">
            {statusLabel}
          </span>
        </div>
        <LanguageToggle
          locale={locale}
          onLocaleChange={onLocaleChange}
          ariaLabel={t('language.ariaLabel')}
        />
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  );
}
