import { FormKindTabs } from '@/components/form/FormKindTabs';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { ShortcutKind } from '@/shared/types';

interface ShortcutFormHeaderProps {
  kind: ShortcutKind;
  editing: boolean;
  onKindChange: (kind: ShortcutKind) => void;
}

export function ShortcutFormHeader({
  kind,
  editing,
  onKindChange,
}: ShortcutFormHeaderProps) {
  const { t } = useUiLocale();

  return (
    <div className="space-y-3">
      <FormKindTabs kind={kind} onKindChange={onKindChange} />
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {editing ? t('form.editShortcut') : t('form.newShortcut')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {kind === 'permanent' ? t('form.permanentHint') : t('form.tempHint')}
        </p>
      </div>
    </div>
  );
}
