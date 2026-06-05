import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UI_LOCALES } from '@/lib/i18n/locales';
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
  return (
    <Select value={locale} onValueChange={(value) => onLocaleChange(value as UiLocale)}>
      <SelectTrigger
        className="h-9 w-auto min-w-[8.5rem] gap-2 border-[var(--color-border)] bg-[var(--color-muted)]/40 px-2.5 lg:min-w-[11rem]"
        aria-label={ariaLabel}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {UI_LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>{item.flag}</span>
              <span dir="auto">{item.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
