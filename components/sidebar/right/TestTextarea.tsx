import { SnippetMenuPortal } from '@/components/snippet/SnippetMenuPortal';
import { useSnippetTextarea } from '@/hooks/use-snippet-textarea';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { AppData } from '@/shared/types';

interface TestTextareaProps {
  data: AppData;
}

export function TestTextarea({ data }: TestTextareaProps) {
  const { dir, locale, t } = useUiLocale();
  const {
    textareaRef,
    menuOpen,
    menuItems,
    menuRect,
    activeIndex,
    setActiveIndex,
    pickItem,
    textareaProps,
  } = useSnippetTextarea({ data, dir, locale });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <textarea ref={textareaRef} {...textareaProps} placeholder={t('right.testPlaceholder')} />
      {menuOpen && menuRect ? (
        <SnippetMenuPortal
          items={menuItems}
          rect={menuRect}
          activeIndex={activeIndex}
          emptyLabel={t('dropdown.noMatches')}
          onPick={pickItem}
          onActiveIndexChange={setActiveIndex}
        />
      ) : null}
    </div>
  );
}
