import { useCallback, useState, type DragEvent } from "react";
import {
	Download,
	FileDown,
	FileJson,
	FileSpreadsheet,
	FileUp,
	Upload,
	type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isAcceptedFile(file: File, accept: string): boolean {
	const tokens = accept.split(",").map((token) => token.trim().toLowerCase());
	const name = file.name.toLowerCase();
	return tokens.some((token) => {
		if (token.startsWith(".")) return name.endsWith(token);
		return file.type === token;
	});
}

function dropIconForAccept(accept: string): LucideIcon {
	return accept.includes(".json") ? FileJson : FileSpreadsheet;
}

interface DataPanelProps {
	title: string;
	description: string;
	templateLabel: string;
	exportLabel: string;
	importLabel: string;
	dropHint?: string;
	dropActiveLabel?: string;
	accept?: string;
	onDownloadTemplate: () => void;
	onExport: () => void;
	onImport: () => void;
	onImportFile?: (file: File) => void;
	onInvalidFile?: () => void;
	nested?: boolean;
}

export function DataPanel({
	title,
	description,
	templateLabel,
	exportLabel,
	importLabel,
	dropHint,
	dropActiveLabel,
	accept,
	onDownloadTemplate,
	onExport,
	onImport,
	onImportFile,
	onInvalidFile,
	nested = false,
}: DataPanelProps) {
	const [dragOver, setDragOver] = useState(false);
	const dropEnabled = Boolean(onImportFile && accept);
	const DropIcon = accept ? dropIconForAccept(accept) : FileUp;
	const actionButtonClassName =
		"h-auto w-full min-w-0 items-start justify-start gap-2 whitespace-normal py-2.5";

	const handleDragEnter = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (!dropEnabled) return;
			event.preventDefault();
			setDragOver(true);
		},
		[dropEnabled],
	);

	const handleDragOver = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (!dropEnabled) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = "copy";
			setDragOver(true);
		},
		[dropEnabled],
	);

	const handleDragLeave = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (!dropEnabled) return;
			if (event.currentTarget.contains(event.relatedTarget as Node)) return;
			setDragOver(false);
		},
		[dropEnabled],
	);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (!dropEnabled) return;
			event.preventDefault();
			setDragOver(false);
			const file = event.dataTransfer.files[0];
			if (!file) return;
			if (accept && !isAcceptedFile(file, accept)) {
				onInvalidFile?.();
				return;
			}
			onImportFile?.(file);
		},
		[accept, dropEnabled, onImportFile, onInvalidFile],
	);

	return (
		<div
			className={cn(
				"relative min-w-0 overflow-hidden rounded-lg border transition-all duration-300 ease-out",
				nested ? "p-3" : "p-3 xl:p-4",
				nested
					? "bg-[var(--color-muted)]/20"
					: "bg-[var(--color-background)]",
				dragOver && dropEnabled
					? "border-2 border-dashed border-[var(--color-foreground)]/25 bg-[var(--color-muted)]/55"
					: "border-[var(--color-border)]",
			)}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{dragOver && dropEnabled ? (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--color-foreground)_0%,transparent_62%)] opacity-[0.06]"
				/>
			) : null}

			<div
				className={cn(
					"relative space-y-3 transition-all duration-300 ease-out",
					dragOver && dropEnabled &&
						"pointer-events-none scale-[0.98] opacity-0 blur-[1.5px]",
				)}
			>
				<div>
					<h3 className="text-sm font-semibold">{title}</h3>
					<p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
						{description}
					</p>
				</div>
				<div className="flex flex-col gap-2">
					<Button
						variant="outline"
						className={actionButtonClassName}
						onClick={onDownloadTemplate}
					>
						<FileDown className="h-4 w-4 shrink-0" />
						<span className="min-w-0 text-start">{templateLabel}</span>
					</Button>
					<Button
						variant="outline"
						className={actionButtonClassName}
						onClick={onExport}
					>
						<Upload className="h-4 w-4 shrink-0" />
						<span className="min-w-0 text-start">{exportLabel}</span>
					</Button>
					<Button
						variant="outline"
						className={actionButtonClassName}
						onClick={onImport}
					>
						<Download className="h-4 w-4 shrink-0" />
						<span className="min-w-0 text-start">{importLabel}</span>
					</Button>
					{dropHint ? (
						<p className="pt-0.5 text-center text-xs text-[var(--color-muted-foreground)]">
							{dropHint}
						</p>
					) : null}
				</div>
			</div>

			{dropEnabled ? (
				<div
					className={cn(
						"absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-5 transition-all duration-300 ease-out",
						dragOver
							? "scale-100 opacity-100"
							: "pointer-events-none scale-[0.97] opacity-0",
					)}
					aria-live="polite"
					aria-hidden={!dragOver}
				>
					<div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg ring-1 ring-[var(--color-foreground)]/5">
						<DropIcon
							className="h-8 w-8 text-[var(--color-foreground)]"
							strokeWidth={1.75}
						/>
						<span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
							<FileUp className="h-3.5 w-3.5 text-[var(--color-foreground)]" />
						</span>
					</div>

					<div className="space-y-2 text-center">
						<p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
							{dropActiveLabel ?? importLabel}
						</p>
						<span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/90 px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-sm">
							{importLabel}
						</span>
					</div>
				</div>
			) : null}
		</div>
	);
}
