import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  addCategory,
  deleteCategory,
  deleteShortcut,
  updateCategory,
  upsertShortcut,
} from '@/lib/app-mutations';
import { clearCategoriesData } from '@/lib/storage';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { TranslationKey, TranslateParams } from '@/lib/i18n/translations';
import type { AppData, Category, Shortcut } from '@/shared/types';
import type { ShortcutFormValues } from '@/shared/schemas';

interface UseShortcutActionsOptions {
  data: AppData | null;
  editing: Shortcut | null;
  persist: (next: AppData, successMsg?: string) => Promise<void>;
  scheduleUndo: (snapshot: AppData, label: string) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  setEditing: (shortcut: Shortcut | null) => void;
}

export function useShortcutActions({
  data,
  editing,
  persist,
  scheduleUndo,
  t,
  setEditing,
}: UseShortcutActionsOptions) {
  const handleDeleteShortcut = useCallback(
    async (shortcut: Shortcut) => {
      if (!data) return;
      const snapshot = data;
      const next = deleteShortcut(data, shortcut.id);
      await persist(next);
      if (editing?.id === shortcut.id) setEditing(null);
      scheduleUndo(snapshot, t('toast.deletedShortcut', { name: shortcut.name }));
    },
    [data, editing?.id, persist, scheduleUndo, setEditing, t],
  );

  const handleFormSubmit = useCallback(
    async (values: ShortcutFormValues, editingId?: string) => {
      if (!data) return;

      try {
        const next = upsertShortcut(data, {
          id: editingId,
          name: values.name,
          shortcut: values.shortcut,
          content: values.content,
          categoryId: values.categoryId,
          kind: values.kind,
        });
        await persist(
          next,
          editingId ? t('toast.shortcutSaved') : t('toast.shortcutAdded'),
        );
        setEditing(null);
      } catch {
        toast.error(t('toast.saveFailed'));
        throw new Error('save failed');
      }
    },
    [data, persist, setEditing, t],
  );

  return { handleDeleteShortcut, handleFormSubmit };
}

interface UseCategoryActionsOptions {
  data: AppData | null;
  editing: Shortcut | null;
  persist: (next: AppData, successMsg?: string) => Promise<void>;
  scheduleUndo: (snapshot: AppData, label: string) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  setEditing: (shortcut: Shortcut | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setData: (data: AppData) => void;
}

export function useCategoryActions({
  data,
  editing,
  persist,
  scheduleUndo,
  t,
  setEditing,
  setSelectedCategoryId,
  setData,
}: UseCategoryActionsOptions) {
  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      if (!data) return;
      const snapshot = data;
      const next = deleteCategory(data, category.id);
      await persist(next);
      if (editing?.categoryId === category.id) setEditing(null);
      scheduleUndo(
        snapshot,
        t('toast.deletedCategory', {
          name:
            category.id === TEMP_CATEGORY_ID
              ? t('sidebar.temporary')
              : category.name,
        }),
      );
    },
    [data, editing?.categoryId, persist, scheduleUndo, setEditing, t],
  );

  const handleClearCategories = useCallback(async () => {
    if (!data) return;
    const snapshot = data;
    const next = await clearCategoriesData();
    setEditing(null);
    setSelectedCategoryId(null);
    setData(next);
    scheduleUndo(snapshot, t('toast.categoriesCleared'));
  }, [data, scheduleUndo, setData, setEditing, setSelectedCategoryId, t]);

  const handleAddCategory = useCallback(
    async (category: Category) => {
      if (!data) return;
      setSelectedCategoryId(category.id);
      const result = addCategory(data, category);
      await persist(result.data, t('toast.categoryAdded'));
    },
    [data, persist, setSelectedCategoryId, t],
  );

  const handleUpdateCategory = useCallback(
    async (category: Category) => {
      if (!data) return;
      const next = updateCategory(data, category.id, {
        name: category.name,
        color: category.color,
      });
      await persist(next, t('toast.categorySaved'));
    },
    [data, persist, t],
  );

  return {
    handleDeleteCategory,
    handleClearCategories,
    handleAddCategory,
    handleUpdateCategory,
  };
}
