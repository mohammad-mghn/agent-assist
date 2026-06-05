import * as React from 'react';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { cn } from '@/lib/utils';
import { detectTextLang } from '@/lib/text-direction';

type MultilingualFieldProps = {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  className?: string;
};

function useMultilingualAttrs(value?: string) {
  const { dir, locale } = useUiLocale();

  return React.useMemo(() => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) {
      return {
        dir,
        lang: locale,
      };
    }

    return {
      dir: 'auto' as const,
      lang: detectTextLang(value ?? ''),
    };
  }, [dir, locale, value]);
}

export const MultilingualInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & MultilingualFieldProps
>(({ className, value, onChange, ...props }, ref) => {
  const attrs = useMultilingualAttrs(
    typeof value === 'string' ? value : undefined,
  );

  return (
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      className={cn(
        'multilingual-field flex h-10 w-full cursor-text rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...attrs}
      {...props}
    />
  );
});
MultilingualInput.displayName = 'MultilingualInput';

export const MultilingualTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & MultilingualFieldProps
>(({ className, value, onChange, ...props }, ref) => {
  const attrs = useMultilingualAttrs(
    typeof value === 'string' ? value : undefined,
  );

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={cn(
        'multilingual-field flex min-h-[88px] w-full cursor-text rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm leading-relaxed shadow-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...attrs}
      {...props}
    />
  );
});
MultilingualTextarea.displayName = 'MultilingualTextarea';
