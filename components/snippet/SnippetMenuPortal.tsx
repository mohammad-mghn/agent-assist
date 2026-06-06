import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShortcutHighlight } from '@/components/snippet/ShortcutHighlight';
import { DROPDOWN_MAX_HEIGHT, dropdownPosition } from '@/lib/dropdown-position';
import type { DropdownItem } from '@/lib/shortcut-index';
import { truncate, cn } from '@/lib/utils';
import { CONTENT_TRUNCATE_LEN } from '@/shared/constants';

interface SnippetMenuPortalProps {
  items: DropdownItem[];
  rect: DOMRect;
  activeIndex: number;
  emptyLabel: string;
  onPick: (item: DropdownItem) => void;
  onActiveIndexChange: (index: number) => void;
}

export function SnippetMenuPortal({
  items,
  rect,
  activeIndex,
  emptyLabel,
  onPick,
  onActiveIndexChange,
}: SnippetMenuPortalProps) {
  const { left, top } = dropdownPosition(rect);

  return createPortal(
    <div
      data-snippet-assist="dropdown"
      className="fixed z-[2147483647] min-w-[320px] max-w-[420px] max-h-[280px] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-1 text-[var(--color-foreground)] shadow-lg"
      style={{ left, top }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length === 0 ? (
        <div className="px-3 py-3 text-center text-sm text-[var(--color-muted-foreground)]">
          {emptyLabel}
        </div>
      ) : (
        items.map((item, i) => {
          const active = i === activeIndex;
          const preview = truncate(item.shortcut.content, CONTENT_TRUNCATE_LEN);
          return (
            <button
              key={`${item.shortcut.id}-${i}`}
              type="button"
              className={cn(
                'grid w-full cursor-pointer grid-cols-[20px_1fr_auto_auto] gap-x-2 gap-y-0.5 rounded-md px-2.5 py-2 text-left text-sm',
                active ? 'bg-[var(--color-muted)]' : 'hover:bg-[var(--color-muted)]/60',
              )}
              onMouseEnter={() => onActiveIndexChange(i)}
              onClick={() => onPick(item)}
            >
              <span className="pt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                {i + 1}
              </span>
              <span className="col-start-2 font-semibold text-[var(--color-foreground)]">
                {item.shortcut.name}
              </span>
              <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                <ShortcutHighlight
                  trigger={item.trigger}
                  shortcut={item.shortcut.shortcut}
                  query={item.query}
                />
              </span>
              <span
                className="max-w-[80px] truncate rounded-full px-1.5 py-0.5 text-[10px] text-white"
                style={{ background: item.category.color }}
              >
                {item.category.name}
              </span>
              <span className="col-span-3 col-start-2 truncate text-[11px] text-[var(--color-muted-foreground)]">
                {preview}
              </span>
            </button>
          );
        })
      )}
    </div>,
    document.body,
  );
}
