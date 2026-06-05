import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUiLocale } from '@/hooks/use-ui-locale';

interface TriggerSettingsProps {
  enabled: boolean;
  dropdownEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onDropdownEnabledChange: (enabled: boolean) => void;
}

export function TriggerSettings({
  enabled,
  dropdownEnabled,
  onEnabledChange,
  onDropdownEnabledChange,
}: TriggerSettingsProps) {
  const { t } = useUiLocale();

  return (
    <div className="mb-4 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 xl:p-4">
      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {t('sidebar.trigger')}
      </Label>
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1 text-sm font-medium">{t('sidebar.extension')}</span>
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
            {t('sidebar.extensionHint')}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1 text-sm font-medium">{t('sidebar.dropdown')}</span>
            <Switch
              checked={dropdownEnabled}
              disabled={!enabled}
              onCheckedChange={onDropdownEnabledChange}
            />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
            {t('sidebar.dropdownHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
