import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { UiTheme } from '@/shared/types';

interface ThemeToggleProps {
  theme: UiTheme;
  onThemeChange: (theme: UiTheme) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const { t } = useUiLocale();

  return (
    <div
      className="flex h-9 min-w-[4.5rem] items-center rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-0.5 lg:min-w-[9.5rem]"
      role="group"
      aria-label={t('theme.ariaLabel')}
    >
      <button
        type="button"
        className={cn(
          'inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded px-2 text-sm font-medium transition-colors lg:px-2.5',
          theme === 'light'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        aria-pressed={theme === 'light'}
        aria-label={t('theme.light')}
        onClick={() => onThemeChange('light')}
      >
        <Sun className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">{t('theme.light')}</span>
      </button>
      <button
        type="button"
        className={cn(
          'inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded px-2 text-sm font-medium transition-colors lg:px-2.5',
          theme === 'dark'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        aria-pressed={theme === 'dark'}
        aria-label={t('theme.dark')}
        onClick={() => onThemeChange('dark')}
      >
        <Moon className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">{t('theme.dark')}</span>
      </button>
    </div>
  );
}
