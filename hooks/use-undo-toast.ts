import { useCallback } from 'react';
import { toast } from 'sonner';
import type { TranslationKey, TranslateParams } from '@/lib/i18n/translations';
import type { AppData } from '@/shared/types';

export function useUndoToast(
  persist: (next: AppData) => Promise<void>,
  refresh: () => Promise<void>,
  t: (key: TranslationKey, params?: TranslateParams) => string,
) {
  return useCallback(
    (snapshot: AppData, label: string) => {
      toast(label, {
        duration: 8000,
        action: {
          label: t('toast.undo'),
          onClick: async () => {
            await persist(snapshot);
            await refresh();
            toast.success(t('toast.restored'));
          },
        },
      });
    },
    [persist, refresh, t],
  );
}
