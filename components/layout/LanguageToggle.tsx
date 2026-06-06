import { LocaleFlagIcon } from '@/components/icons/locale-flag-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { getLocaleConfig, UI_LOCALES } from '@/lib/i18n/locales';
import type { UiLocale } from '@/shared/types';

interface LanguageToggleProps {
  locale: UiLocale;
  onLocaleChange: (locale: UiLocale) => void;
  ariaLabel: string;
}

export function LanguageToggle({
  locale,
  onLocaleChange,
  ariaLabel,
}: LanguageToggleProps) {
  const currentLocale = getLocaleConfig(locale);

  return (
    <Select value={locale} onValueChange={(value) => onLocaleChange(value as UiLocale)}>
      <SelectTrigger
        className="h-9 w-auto min-w-[8.5rem] gap-2 border-[var(--color-border)] bg-[var(--color-muted)]/40 px-2.5 py-0 lg:min-w-[11rem]"
        aria-label={ariaLabel}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <LocaleFlagIcon locale={locale} />
          <span dir="auto" className="truncate">
            {currentLocale.nativeLabel}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        {UI_LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            <span className="inline-flex items-center gap-2">
              <LocaleFlagIcon locale={item.code} />
              <span dir="auto">{item.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
