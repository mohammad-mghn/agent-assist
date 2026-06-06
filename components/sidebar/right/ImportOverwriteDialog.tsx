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
import type { ImportDialogState } from '@/components/sidebar/right/types';

interface ImportOverwriteDialogProps {
  importDialog: ImportDialogState;
  onImportDialogChange: (dialog: ImportDialogState) => void;
  onImportPermanent: (
    payload: unknown,
    overwrite: boolean,
    skippedRows?: number,
  ) => void;
  onImportTemp: (
    payload: unknown,
    overwrite: boolean,
    skippedRows?: number,
  ) => void;
}

export function ImportOverwriteDialog({
  importDialog,
  onImportDialogChange,
  onImportPermanent,
  onImportTemp,
}: ImportOverwriteDialogProps) {
  const { dir, t } = useUiLocale();

  const importTypeLabel =
    importDialog?.type === 'permanent'
      ? t('right.permanentTitle').toLowerCase()
      : t('right.tempTitle').toLowerCase();

  return (
    <Dialog
      open={!!importDialog?.open}
      onOpenChange={(open) => !open && onImportDialogChange(null)}
    >
      <DialogContent dir={dir}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <DialogTitle className="flex-1 pe-2 text-start">
              {t('right.overwriteTitle')}
            </DialogTitle>
            <DialogCloseButton />
          </div>
          <DialogDescription className="pt-1">
            {t('right.overwriteDesc', { type: importTypeLabel })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onImportDialogChange(null)}
          >
            {t('right.overwriteCancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!importDialog) return;
              const skippedRows = importDialog.skippedRows ?? 0;
              if (importDialog.type === 'permanent') {
                onImportPermanent(importDialog.payload, true, skippedRows);
              } else {
                onImportTemp(importDialog.payload, true, skippedRows);
              }
              onImportDialogChange(null);
            }}
          >
            {t('right.overwriteConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
