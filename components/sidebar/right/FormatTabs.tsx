import { cn } from '@/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';

export type ExportFormat = 'excel' | 'json';

interface FormatTabsProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export function FormatTabs({ format, onFormatChange }: FormatTabsProps) {
  const { t } = useUiLocale();

  return (
    <div
      className="inline-flex w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-1"
      role="tablist"
      aria-label={t('right.formatTabs')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={format === 'excel'}
        className={cn(
          'flex-1 cursor-pointer rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap lg:px-3 lg:text-sm',
          format === 'excel'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        onClick={() => onFormatChange('excel')}
      >
        {t('right.formatExcel')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={format === 'json'}
        className={cn(
          'flex-1 cursor-pointer rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap lg:px-3 lg:text-sm',
          format === 'json'
            ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        )}
        onClick={() => onFormatChange('json')}
      >
        {t('right.formatJson')}
      </button>
    </div>
  );
}
