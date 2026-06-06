import { cn } from '@/lib/utils';
import type { UiLocale } from '@/shared/types';

const FLAG_SIZE = 20;

const LOCALE_FLAG_FILE: Record<UiLocale, string> = {
  'en-US': 'en',
  'en-GB': 'en-gb',
  fa: 'fa',
  ar: 'ar',
  tr: 'tr',
  ku: 'ku',
};

type LocaleFlagIconProps = {
  locale: UiLocale;
  className?: string;
};

export function LocaleFlagIcon({ locale, className }: LocaleFlagIconProps) {
  const flagFile = LOCALE_FLAG_FILE[locale];

  return (
    <img
      src={`/icons/flags/${flagFile}.png`}
      alt=""
      width={FLAG_SIZE}
      height={FLAG_SIZE}
      aria-hidden
      className={cn(
        'block h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-[var(--color-border)]/60',
        className,
      )}
    />
  );
}
