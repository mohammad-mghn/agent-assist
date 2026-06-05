import { cn } from '@/lib/utils';

interface ShortcutHighlightProps {
  trigger: string;
  shortcut: string;
  query: string;
}

export function ShortcutHighlight({
  trigger,
  shortcut,
  query,
}: ShortcutHighlightProps) {
  if (!query) {
    return (
      <span>
        {trigger}
        {shortcut}
      </span>
    );
  }

  const isExact = shortcut.toLowerCase() === query.toLowerCase();

  return (
    <span>
      {trigger}
      <span
        className={cn(
          'font-semibold',
          isExact ? 'text-green-600' : 'text-blue-600',
        )}
      >
        {shortcut.slice(0, query.length)}
      </span>
      {shortcut.slice(query.length)}
    </span>
  );
}
