import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/hooks/use-ui-locale";
import { triggerForKind } from "@/lib/shortcut-index";
import { cn } from "@/lib/utils";
import type { Shortcut } from "@/shared/types";

interface ShortcutRowProps {
	shortcut: Shortcut;
	selected: boolean;
	onSelect: (shortcut: Shortcut) => void;
	onDelete: (shortcut: Shortcut) => void;
}

export function ShortcutRow({
	shortcut,
	selected,
	onSelect,
	onDelete,
}: ShortcutRowProps) {
	const { t } = useUiLocale();
	const prefix = triggerForKind(shortcut.kind);

	return (
		<div
			className={cn(
				"group flex min-w-0 items-center gap-0.5 rounded-[10px] pe-2 hover:bg-[var(--color-muted)]/60",
				selected && "bg-[var(--color-muted)]/60",
			)}
		>
			<button
				type="button"
				className="min-w-0 flex-1 cursor-pointer overflow-hidden rounded-[10px] px-2 py-1.5 text-start text-sm"
				onClick={() => onSelect(shortcut)}
			>
				<span className="flex min-w-0 flex-col gap-0.5 overflow-hidden">
					<span className="min-w-0 truncate" dir="auto">
						{shortcut.name}
					</span>
					<span
						className="min-w-0 truncate font-mono text-xs text-[var(--color-muted-foreground)]"
						dir="ltr"
					>
						{prefix}
						{shortcut.shortcut}
					</span>
				</span>
			</button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="h-7 w-7 shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
				aria-label={t("sidebar.deleteShortcut", { name: shortcut.name })}
				onClick={() => onDelete(shortcut)}
			>
				<Trash2 className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
}
