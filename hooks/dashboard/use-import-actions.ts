import { useCallback } from 'react';
import { toast } from 'sonner';
import { importPermanent, importTemp } from '@/lib/app-mutations';
import { parsePermanentExport, parseTempExport } from '@/lib/export-import';
import type { TranslationKey, TranslateParams } from '@/lib/i18n/translations';
import type { AppData } from '@/shared/types';

interface UseImportActionsOptions {
  data: AppData | null;
  persist: (next: AppData, successMsg?: string) => Promise<void>;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

export function useImportActions({ data, persist, t }: UseImportActionsOptions) {
  const handleImportPermanent = useCallback(
    async (payload: unknown, overwrite: boolean) => {
      const parsed = parsePermanentExport(payload);
      if (!parsed.success || !data) {
        toast.error(t('toast.invalidPermanentImport'));
        return;
      }
      try {
        const next = importPermanent(
          data,
          parsed.data.categories as AppData['categories'],
          parsed.data.shortcuts,
          overwrite,
        );
        await persist(next, t('toast.permanentImported'));
      } catch {
        toast.error(t('toast.importFailed'));
      }
    },
    [data, persist, t],
  );

  const handleImportTemp = useCallback(
    async (payload: unknown, overwrite: boolean) => {
      const parsed = parseTempExport(payload);
      if (!parsed.success || !data) {
        toast.error(t('toast.invalidTempImport'));
        return;
      }
      try {
        const next = importTemp(data, parsed.data.shortcuts, overwrite);
        await persist(next, t('toast.tempImported'));
      } catch {
        toast.error(t('toast.importFailed'));
      }
    },
    [data, persist, t],
  );

  return { handleImportPermanent, handleImportTemp };
}
