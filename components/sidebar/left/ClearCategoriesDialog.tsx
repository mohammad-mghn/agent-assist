import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUiLocale } from '@/hooks/use-ui-locale';

interface ClearCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearCategoriesDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearCategoriesDialogProps) {
  const { dir, t } = useUiLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <DialogTitle className="flex-1 pe-2 text-start">
              {t('sidebar.clearCategoriesTitle')}
            </DialogTitle>
            <DialogCloseButton />
          </div>
          <DialogDescription className="pt-1">
            {t('sidebar.clearCategoriesDesc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('form.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t('sidebar.clearCategoriesConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
