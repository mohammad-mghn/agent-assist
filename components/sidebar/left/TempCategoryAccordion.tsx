import { ChevronDown, Trash2 } from 'lucide-react';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ShortcutRow } from '@/components/sidebar/left/ShortcutRow';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { Category, Shortcut } from '@/shared/types';

interface TempCategoryAccordionProps {
  tempCategory: Category | undefined;
  shortcuts: Shortcut[];
  selectedId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectShortcut: (shortcut: Shortcut) => void;
  onDeleteCategory: (category: Category) => void;
  onDeleteShortcut: (shortcut: Shortcut) => void;
}

export function TempCategoryAccordion({
  tempCategory,
  shortcuts,
  selectedId,
  onSelectCategory,
  onSelectShortcut,
  onDeleteCategory,
  onDeleteShortcut,
}: TempCategoryAccordionProps) {
  const { t } = useUiLocale();

  return (
    <AccordionItem value="temp">
      <AccordionHeader className="group/temp">
        <AccordionTrigger
          onClick={() => onSelectCategory(TEMP_CATEGORY_ID)}
          className="min-w-0"
        >
          <span className="min-w-0 flex-1 truncate text-start">
            {t('sidebar.temporary')} (#)
          </span>
          {tempCategory && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 cursor-pointer opacity-0 group-hover/temp:opacity-100 focus-visible:opacity-100"
              aria-label={t('sidebar.deleteCategory', {
                name: t('sidebar.temporary'),
              })}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(tempCategory);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <ChevronDown className="chevron order-last h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] rtl:order-first" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        {shortcuts.length === 0 ? (
          <p className="px-1 text-xs text-[var(--color-muted-foreground)]">
            {t('sidebar.noTempShortcuts')}
          </p>
        ) : (
          shortcuts.map((shortcut) => (
            <ShortcutRow
              key={shortcut.id}
              shortcut={shortcut}
              selected={selectedId === shortcut.id}
              onSelect={onSelectShortcut}
              onDelete={onDeleteShortcut}
            />
          ))
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
