import { cn } from '@/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { ShortcutKind } from '@/shared/types';

interface FormKindTabsProps {
  kind: ShortcutKind;
  onKindChange: (kind: ShortcutKind) => void;
}

export function FormKindTabs({ kind, onKindChange }: FormKindTabsProps) {
  const { t } = useUiLocale();

  return (
    <div
      className="inline-flex w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-1"
      role="tablist"
      aria-label={t('form.shortcutType')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={kind === 'permanent'}
        className={cn(
          'flex-1 cursor-pointer rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap lg:px-3 lg:text-sm',
          kind === 'permanent'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        onClick={() => onKindChange('permanent')}
      >
        {t('form.mainShortcuts')}
        <span className="ms-1.5 font-mono text-xs opacity-70">/</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={kind === 'temp'}
        className={cn(
          'flex-1 cursor-pointer rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap lg:px-3 lg:text-sm',
          kind === 'temp'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        onClick={() => onKindChange('temp')}
      >
        {t('form.tempShortcuts')}
        <span className="ms-1.5 font-mono text-xs opacity-70">#</span>
      </button>
    </div>
  );
}
