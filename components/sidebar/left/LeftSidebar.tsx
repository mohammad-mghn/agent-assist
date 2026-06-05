import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CategoryAccordionItem } from '@/components/sidebar/left/CategoryAccordionItem';
import { ClearCategoriesDialog } from '@/components/sidebar/left/ClearCategoriesDialog';
import { TempCategoryAccordion } from '@/components/sidebar/left/TempCategoryAccordion';
import { TriggerSettings } from '@/components/sidebar/left/TriggerSettings';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { getCategoriesForSidebar, getTempShortcuts } from '@/lib/shortcut-index';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { AppData, Category, Shortcut } from '@/shared/types';

interface LeftSidebarProps {
  data: AppData;
  enabled: boolean;
  dropdownEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onDropdownEnabledChange: (enabled: boolean) => void;
  selectedId: string | null;
  onSelectShortcut: (shortcut: Shortcut) => void;
  onSelectCategory: (categoryId: string) => void;
  onDeleteShortcut: (shortcut: Shortcut) => void;
  onDeleteCategory: (category: Category) => void;
  onClearCategories: () => void;
}

export function LeftSidebar({
  data,
  enabled,
  dropdownEnabled,
  onEnabledChange,
  onDropdownEnabledChange,
  selectedId,
  onSelectShortcut,
  onSelectCategory,
  onDeleteShortcut,
  onDeleteCategory,
  onClearCategories,
}: LeftSidebarProps) {
  const { dir, t } = useUiLocale();
  const [resetOpen, setResetOpen] = useState(false);
  const tempShortcuts = getTempShortcuts(data);
  const tempCategory = data.categories.find((c) => c.id === TEMP_CATEGORY_ID);
  const categories = getCategoriesForSidebar(data);

  return (
    <aside
      dir={dir}
      className="flex h-full min-h-0 w-[var(--layout-sidebar-left)] shrink-0 flex-col border-e border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 xl:p-4"
    >
      <TriggerSettings
        enabled={enabled}
        dropdownEnabled={dropdownEnabled}
        onEnabledChange={onEnabledChange}
        onDropdownEnabledChange={onDropdownEnabledChange}
      />

      <Button
        type="button"
        variant="outline"
        className="mb-4 w-full shrink-0 cursor-pointer text-sm text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
        onClick={() => setResetOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        {t('sidebar.clearCategories')}
      </Button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Accordion type="multiple" className="space-y-2.5" defaultValue={['temp']}>
          <TempCategoryAccordion
            tempCategory={tempCategory}
            shortcuts={tempShortcuts}
            selectedId={selectedId}
            onSelectCategory={onSelectCategory}
            onSelectShortcut={onSelectShortcut}
            onDeleteCategory={onDeleteCategory}
            onDeleteShortcut={onDeleteShortcut}
          />

          {categories.map((cat) => (
            <CategoryAccordionItem
              key={cat.id}
              category={cat}
              shortcuts={data.shortcuts.filter(
                (s) => s.kind === 'permanent' && s.categoryId === cat.id,
              )}
              selectedId={selectedId}
              onSelectCategory={onSelectCategory}
              onSelectShortcut={onSelectShortcut}
              onDeleteCategory={onDeleteCategory}
              onDeleteShortcut={onDeleteShortcut}
            />
          ))}
        </Accordion>
      </div>

      <ClearCategoriesDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={onClearCategories}
      />
    </aside>
  );
}
