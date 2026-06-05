import { FolderPlus } from 'lucide-react';
import { FormField } from '@/components/form/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { Category } from '@/shared/types';

export const NEW_CATEGORY_VALUE = '__new_category__';

interface CategorySelectFieldProps {
  categoryId: string;
  categories: Category[];
  error?: string;
  onCategoryChange: (categoryId: string) => void;
  onNewCategory: () => void;
}

export function CategorySelectField({
  categoryId,
  categories,
  error,
  onCategoryChange,
  onNewCategory,
}: CategorySelectFieldProps) {
  const { t } = useUiLocale();
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <FormField
      label={t('form.category')}
      error={error}
      hint={
        categories.length === 0 ? t('form.createCategoryHint') : undefined
      }
    >
      <Select
        value={categoryId}
        onValueChange={(v) => {
          if (v === NEW_CATEGORY_VALUE) {
            onNewCategory();
            return;
          }
          onCategoryChange(v);
        }}
      >
        <SelectTrigger>
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              {selectedCategory.name}
            </span>
          ) : (
            <SelectValue
              placeholder={
                categories.length === 0
                  ? t('form.createCategoryFirst')
                  : t('form.selectCategory')
              }
            />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value={NEW_CATEGORY_VALUE}
            className="font-medium text-[var(--color-primary)]"
          >
            <span className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4 shrink-0" />
              {t('form.newCategory')}
            </span>
          </SelectItem>
          {categories.length > 0 && <SelectSeparator />}
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
