import { Controller } from 'react-hook-form';
import { CategorySelectField } from '@/components/form/CategorySelectField';
import { FormField } from '@/components/form/FormField';
import { MultilingualInput, MultilingualTextarea } from '@/components/form/MultilingualField';
import { ShortcutFormActions } from '@/components/form/ShortcutFormActions';
import { ShortcutFormHeader } from '@/components/form/ShortcutFormHeader';
import { ShortcutTriggerField } from '@/components/form/ShortcutTriggerField';
import { useShortcutForm } from '@/hooks/use-shortcut-form';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { findDuplicateShortcut, triggerForKind } from '@/lib/shortcut-index';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { ShortcutFormValues } from '@/shared/schemas';
import type { AppData, Shortcut, ShortcutKind } from '@/shared/types';

interface ShortcutFormProps {
  data: AppData;
  editing: Shortcut | null;
  kind: ShortcutKind;
  onKindChange: (kind: ShortcutKind) => void;
  selectedCategoryId: string | null;
  onSubmit: (values: ShortcutFormValues, editingId?: string) => void;
  onCancel: () => void;
  onNewCategory: () => void;
}

export function ShortcutForm({
  data,
  editing,
  kind,
  onKindChange,
  selectedCategoryId,
  onSubmit,
  onCancel,
  onNewCategory,
}: ShortcutFormProps) {
  const { locale, t } = useUiLocale();
  const duplicateMessage = t('toast.shortcutExists');

  const {
    form,
    errors,
    isDirty,
    categoryId,
    shortcutError,
    duplicateShortcutError,
    handleKindChange,
    reset,
    setError,
  } = useShortcutForm({
    data,
    editing,
    kind,
    selectedCategoryId,
    locale,
    onKindChange,
    duplicateMessage,
  });

  const { control, handleSubmit: submitForm, setValue } = form;
  const triggerPrefix = triggerForKind(kind);
  const permanentCategories = data.categories.filter(
    (c) => c.id !== TEMP_CATEGORY_ID,
  );

  const handleSubmit = submitForm((values) => {
    if (findDuplicateShortcut(data, values.shortcut, kind, editing?.id)) {
      setError('shortcut', { message: duplicateMessage });
      return;
    }
    onSubmit({ ...values, kind }, editing?.id);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-snippet-assist>
      <ShortcutFormHeader
        kind={kind}
        editing={!!editing}
        onKindChange={handleKindChange}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FormField
          label={t('form.name')}
          htmlFor="name"
          error={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <MultilingualInput
                id="name"
                placeholder={t('form.namePlaceholder')}
                {...field}
              />
            )}
          />
        </FormField>

        <ShortcutTriggerField
          control={control}
          triggerPrefix={triggerPrefix}
          error={shortcutError}
        />
      </div>

      {kind === 'permanent' && (
        <CategorySelectField
          categoryId={categoryId}
          categories={permanentCategories}
          error={errors.categoryId?.message}
          onCategoryChange={(v) => setValue('categoryId', v, { shouldDirty: true })}
          onNewCategory={onNewCategory}
        />
      )}

      <FormField
        label={t('form.content')}
        htmlFor="content"
        error={errors.content?.message}
      >
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MultilingualTextarea
              id="content"
              placeholder={t('form.contentPlaceholder')}
              rows={6}
              className="min-h-[8rem] xl:min-h-[10rem] 2xl:min-h-[12rem]"
              {...field}
            />
          )}
        />
      </FormField>

      <ShortcutFormActions
        editing={!!editing}
        isDirty={isDirty}
        submitDisabled={(!isDirty && !!editing) || !!duplicateShortcutError}
        onCancel={() => {
          onCancel();
          reset();
        }}
      />
    </form>
  );
}
