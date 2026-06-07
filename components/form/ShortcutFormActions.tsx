import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiLocale } from '@/hooks/use-ui-locale';

interface ShortcutFormActionsProps {
  editing: boolean;
  isDirty: boolean;
  submitDisabled: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ShortcutFormActions({
  editing,
  isDirty,
  submitDisabled,
  onCancel,
  onDelete,
}: ShortcutFormActionsProps) {
  const { t } = useUiLocale();

  return (
    <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
      {editing && onDelete ? (
        <Button
          type="button"
          variant="outline"
          size="default"
          className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)] lg:min-w-[120px]"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          {t('form.delete')}
        </Button>
      ) : (
        <span className="hidden lg:block" />
      )}
      <div className="flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">
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
    </div>
  );
}
