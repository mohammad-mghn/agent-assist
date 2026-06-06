import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getDefaultCategoryId } from '@/components/form/shortcut-form-utils';
import { findDuplicateShortcut } from '@/lib/shortcut-index';
import { translations } from '@/lib/i18n/translations';
import {
  createShortcutFormSchema,
  type ShortcutFormValues,
} from '@/shared/schemas';
import type { AppData, Shortcut, ShortcutKind } from '@/shared/types';

interface UseShortcutFormOptions {
  data: AppData;
  editing: Shortcut | null;
  kind: ShortcutKind;
  selectedCategoryId: string | null;
  formResetKey: number;
  locale: keyof typeof translations;
  onKindChange: (kind: ShortcutKind) => void;
  duplicateMessage: string;
}

export function useShortcutForm({
  data,
  editing,
  kind,
  selectedCategoryId,
  formResetKey,
  locale,
  onKindChange,
  duplicateMessage,
}: UseShortcutFormOptions) {
  const schema = useMemo(
    () => createShortcutFormSchema(translations[locale]),
    [locale],
  );

  const form = useForm<ShortcutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      categoryId: getDefaultCategoryId(data, kind),
      content: '',
      shortcut: '',
      kind,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        categoryId: editing.categoryId,
        content: editing.content,
        shortcut: editing.shortcut,
        kind: editing.kind,
      });
      return;
    }

    form.reset({
      name: '',
      categoryId: selectedCategoryId ?? getDefaultCategoryId(data, kind),
      content: '',
      shortcut: '',
      kind,
    });
  }, [editing, kind, formResetKey, form]);

  useEffect(() => {
    if (editing || !selectedCategoryId) return;
    if (!data.categories.some((c) => c.id === selectedCategoryId)) return;
    if (form.getValues('categoryId') === selectedCategoryId) return;
    form.setValue('categoryId', selectedCategoryId, { shouldDirty: true });
  }, [data.categories, selectedCategoryId, editing, form]);

  const {
    formState: { errors, isDirty },
    clearErrors,
    reset,
    setError,
    watch,
  } = form;

  const shortcutVal = watch('shortcut');
  const categoryId = watch('categoryId');
  const duplicate = findDuplicateShortcut(data, shortcutVal, kind, editing?.id);
  const duplicateShortcutError =
    duplicate && shortcutVal.trim() ? duplicateMessage : undefined;
  const shortcutError = errors.shortcut?.message ?? duplicateShortcutError;

  useEffect(() => {
    if (!duplicate && errors.shortcut?.message === duplicateMessage) {
      clearErrors('shortcut');
    }
  }, [duplicate, errors.shortcut?.message, duplicateMessage, clearErrors]);

  const handleKindChange = (next: ShortcutKind) => {
    onKindChange(next);
    if (!editing) {
      reset({
        name: '',
        categoryId: getDefaultCategoryId(data, next),
        content: '',
        shortcut: '',
        kind: next,
      });
    }
  };

  return {
    form,
    errors,
    isDirty,
    categoryId,
    shortcutError,
    duplicateShortcutError,
    handleKindChange,
    reset,
    setError,
  };
}
