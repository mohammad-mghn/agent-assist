import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { FormField } from '@/components/form/FormField';
import { MultilingualInput } from '@/components/form/MultilingualField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { CATEGORY_COLORS, randomCategoryColor } from '@/shared/constants';
import {
  createCategoryFormSchema,
  type CategoryFormValues,
} from '@/shared/schemas';
import type { Category } from '@/shared/types';
import { generateId } from '@/lib/utils';
import { translations } from '@/lib/i18n/translations';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onAdd: (category: Category) => void;
  onUpdate?: (category: Category) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  onAdd,
  onUpdate,
}: CategoryModalProps) {
  const { locale, dir, t } = useUiLocale();
  const isEditing = category != null;
  const schema = useMemo(
    () => createCategoryFormSchema(translations[locale]),
    [locale],
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: randomCategoryColor() },
  });

  useEffect(() => {
    if (!open) return;
    if (category) {
      form.reset({ name: category.name, color: category.color });
      return;
    }
    form.reset({ name: '', color: randomCategoryColor() });
  }, [open, category, form]);

  const onSubmit = form.handleSubmit((values) => {
    const nextCategory: Category = {
      id: category?.id ?? generateId(),
      name: values.name,
      color: values.color as Category['color'],
    };

    if (isEditing) {
      onUpdate?.(nextCategory);
    } else {
      onAdd(nextCategory);
    }

    form.reset({ name: '', color: randomCategoryColor() });
    onOpenChange(false);
  });

  const selectedColor = form.watch('color');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="flex-1 pe-2 text-start">
              {isEditing ? t('category.editTitle') : t('category.newTitle')}
            </DialogTitle>
            <DialogCloseButton />
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label={t('category.name')}
            htmlFor="cat-name"
            error={form.formState.errors.name?.message}
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <MultilingualInput
                  id="cat-name"
                  placeholder={t('category.namePlaceholder')}
                  {...field}
                />
              )}
            />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <Label>{t('category.color')}</Label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-8 w-full cursor-pointer rounded-md border-2 transition-transform hover:scale-105',
                    selectedColor === color
                      ? 'border-[var(--color-foreground)]'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color, { shouldDirty: true })}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            {!isEditing && <Plus className="h-4 w-4" />}
            {isEditing ? t('category.save') : t('category.add')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
