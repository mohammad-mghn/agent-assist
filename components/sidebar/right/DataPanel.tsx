import { Download, FileDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataPanelProps {
	title: string;
	description: string;
	templateLabel: string;
	exportLabel: string;
	importLabel: string;
	onDownloadTemplate: () => void;
	onExport: () => void;
	onImport: () => void;
	nested?: boolean;
}

export function DataPanel({
	title,
	description,
	templateLabel,
	exportLabel,
	importLabel,
	onDownloadTemplate,
	onExport,
	onImport,
	nested = false,
}: DataPanelProps) {
	const actionButtonClassName =
		"h-auto w-full min-w-0 items-start justify-start gap-2 whitespace-normal py-2.5";

	return (
		<div
			className={
				nested
					? "min-w-0 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-3"
					: "min-w-0 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 xl:p-4"
			}
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
			</div>
		</div>
	);
}
