import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiLocale } from '@/hooks/use-ui-locale';

interface ShortcutFormActionsProps {
  editing: boolean;
  isDirty: boolean;
  submitDisabled: boolean;
  onCancel: () => void;
}

export function ShortcutFormActions({
  editing,
  isDirty,
  submitDisabled,
  onCancel,
}: ShortcutFormActionsProps) {
  const { t } = useUiLocale();

  return (
    <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:justify-end">
      <Button
        type="button"
        variant="outline"
        size="default"
        className="lg:min-w-[120px]"
        disabled={!isDirty}
        onClick={onCancel}
      >
        {t('form.cancel')}
      </Button>
      <Button
        type="submit"
        size="default"
        className="lg:min-w-[120px]"
        disabled={submitDisabled}
      >
        {editing ? (
          <>
            <Save className="h-4 w-4" />
            {t('form.save')}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {t('form.addShortcut')}
          </>
        )}
      </Button>
    </div>
  );
}
