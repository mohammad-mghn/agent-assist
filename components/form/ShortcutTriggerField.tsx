import { Controller, type Control } from 'react-hook-form';
import { FormField } from '@/components/form/FormField';
import { MultilingualInput } from '@/components/form/MultilingualField';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { sanitizeShortcutToken, type ShortcutFormValues } from '@/shared/schemas';

interface ShortcutTriggerFieldProps {
  control: Control<ShortcutFormValues>;
  triggerPrefix: string;
  error?: string;
}

export function ShortcutTriggerField({
  control,
  triggerPrefix,
  error,
}: ShortcutTriggerFieldProps) {
  const { t } = useUiLocale();

  return (
    <FormField
      label={t('form.shortcut')}
      htmlFor="shortcut"
      error={error}
      hint={!error ? t('form.shortcutHint', { prefix: triggerPrefix }) : undefined}
    >
      <div className="flex h-10 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-ring)]">
        <span
          className="flex h-full shrink-0 items-center border-e border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3 font-mono text-sm font-medium text-[var(--color-muted-foreground)]"
          aria-hidden
        >
          {triggerPrefix}
        </span>
        <Controller
          name="shortcut"
          control={control}
          render={({ field }) => (
            <MultilingualInput
              id="shortcut"
              placeholder={t('form.shortcutPlaceholder')}
              className="h-full min-h-0 flex-1 rounded-none border-0 bg-transparent px-3 py-0 shadow-none focus-visible:ring-0"
              {...field}
              onChange={(e) =>
                field.onChange(sanitizeShortcutToken(e.target.value))
              }
            />
          )}
        />
      </div>
    </FormField>
  );
}
