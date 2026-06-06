import type { TranslationKey, TranslateParams } from '@/lib/i18n/translations';
import type { AppData, Shortcut } from '@/shared/types';
import {
  useCategoryActions,
  useShortcutActions,
} from '@/hooks/dashboard/use-shortcut-actions';
import { useImportActions } from '@/hooks/dashboard/use-import-actions';

interface UseDashboardActionsOptions {
  data: AppData | null;
  editing: Shortcut | null;
  persist: (next: AppData, successMsg?: string) => Promise<void>;
  scheduleUndo: (snapshot: AppData, label: string) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  setEditing: (shortcut: Shortcut | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setData: (data: AppData) => void;
}

export function useDashboardActions(options: UseDashboardActionsOptions) {
  const { handleDeleteShortcut, handleFormSubmit } = useShortcutActions(options);
  const { handleDeleteCategory, handleClearCategories, handleAddCategory, handleUpdateCategory } =
    useCategoryActions(options);
  const { handleImportPermanent, handleImportTemp } = useImportActions(options);

  return {
    handleDeleteShortcut,
    handleDeleteCategory,
    handleFormSubmit,
    handleImportPermanent,
    handleImportTemp,
    handleClearCategories,
    handleAddCategory,
    handleUpdateCategory,
  };
}
