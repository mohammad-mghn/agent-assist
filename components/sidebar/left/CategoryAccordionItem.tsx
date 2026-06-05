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
import type { Category, Shortcut } from '@/shared/types';

interface CategoryAccordionItemProps {
  category: Category;
  shortcuts: Shortcut[];
  selectedId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectShortcut: (shortcut: Shortcut) => void;
  onDeleteCategory: (category: Category) => void;
  onDeleteShortcut: (shortcut: Shortcut) => void;
}

export function CategoryAccordionItem({
  category,
  shortcuts,
  selectedId,
  onSelectCategory,
  onSelectShortcut,
  onDeleteCategory,
  onDeleteShortcut,
}: CategoryAccordionItemProps) {
  const { t } = useUiLocale();

  return (
    <AccordionItem value={category.id}>
      <AccordionHeader className="group/cat">
        <AccordionTrigger
          onClick={() => onSelectCategory(category.id)}
          className="min-w-0"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="truncate" dir="auto">
              {category.name}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 cursor-pointer opacity-0 group-hover/cat:opacity-100 focus-visible:opacity-100"
            aria-label={t('sidebar.deleteCategory', { name: category.name })}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <ChevronDown className="chevron order-last h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] rtl:order-first" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        {shortcuts.length === 0 ? (
          <p className="px-1 text-xs text-[var(--color-muted-foreground)]">
            {t('sidebar.noShortcuts')}
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
