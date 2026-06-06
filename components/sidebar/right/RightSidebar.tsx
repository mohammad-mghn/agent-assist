import { useRef, useState } from "react";
import { toast } from "sonner";
import { DataExportBox } from "@/components/sidebar/right/DataExportBox";
import type { ExportFormat } from "@/components/sidebar/right/FormatTabs";
import { ImportOverwriteDialog } from "@/components/sidebar/right/ImportOverwriteDialog";
import { TestTypingDialog } from "@/components/sidebar/right/TestTypingDialog";
import type { ImportDialogState } from "@/components/sidebar/right/types";
import {
	buildPermanentExport,
	buildTempExport,
	downloadJson,
	hasPermanentImportData,
	hasTempImportData,
	parsePermanentExport,
	parseTempExport,
	readJsonFile,
} from "@/lib/export-import";
import {
	buildPermanentExcel,
	buildPermanentExcelTemplate,
	buildPermanentJsonTemplate,
	buildTempExcel,
	buildTempExcelTemplate,
	buildTempJsonTemplate,
	downloadExcel,
	parsePermanentExcel,
	parseTempExcel,
	readExcelFile,
} from "@/lib/excel-export-import";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/hooks/use-ui-locale";
import type { AppData } from "@/shared/types";

interface RightSidebarProps {
	data: AppData;
	importDialog: ImportDialogState;
	onImportDialogChange: (dialog: ImportDialogState) => void;
	onImportPermanent: (
		payload: unknown,
		overwrite: boolean,
		skippedRows?: number,
	) => void;
	onImportTemp: (
		payload: unknown,
		overwrite: boolean,
		skippedRows?: number,
	) => void;
}

export function RightSidebar({
	data,
	importDialog,
	onImportDialogChange,
	onImportPermanent,
	onImportTemp,
}: RightSidebarProps) {
	const { t } = useUiLocale();
	const [format, setFormat] = useState<ExportFormat>("excel");
	const permJsonInputRef = useRef<HTMLInputElement>(null);
	const tempJsonInputRef = useRef<HTMLInputElement>(null);
	const permExcelInputRef = useRef<HTMLInputElement>(null);
	const tempExcelInputRef = useRef<HTMLInputElement>(null);

	const handleExportError = () => {
		toast.error(t("toast.exportFailed"));
	};

	const handleDownloadPermanentTemplate = async () => {
		try {
			if (format === "json") {
				await downloadJson(
					"agent-assist-permanent-template.json",
					buildPermanentJsonTemplate(),
				);
				return;
			}
			const buffer = await buildPermanentExcelTemplate();
			await downloadExcel("agent-assist-permanent-template.xlsx", buffer);
		} catch {
			handleExportError();
		}
	};

	const handleDownloadTempTemplate = async () => {
		try {
			if (format === "json") {
				await downloadJson(
					"agent-assist-temp-template.json",
					buildTempJsonTemplate(),
				);
				return;
			}
			const buffer = await buildTempExcelTemplate();
			await downloadExcel("agent-assist-temp-template.xlsx", buffer);
		} catch {
			handleExportError();
		}
	};

	const handlePermExport = async () => {
		try {
			if (format === "json") {
				await downloadJson(
					"agent-assist-permanent.json",
					buildPermanentExport(data),
				);
				return;
			}
			const buffer = await buildPermanentExcel(data);
			await downloadExcel("agent-assist-permanent.xlsx", buffer);
		} catch {
			handleExportError();
		}
	};

	const handleTempExport = async () => {
		try {
			if (format === "json") {
				await downloadJson("agent-assist-temp.json", buildTempExport(data));
				return;
			}
			const buffer = await buildTempExcel(data);
			await downloadExcel("agent-assist-temp.xlsx", buffer);
		} catch {
			handleExportError();
		}
	};

	const handlePermImport = async (file: File) => {
		if (format === "json") {
			const raw = await readJsonFile(file);
			const parsed = parsePermanentExport(raw);
			if (!parsed.success) {
				toast.error(t("toast.invalidPermanentJson"));
				return;
			}
			if (hasPermanentImportData(data)) {
				onImportDialogChange({
					open: true,
					type: "permanent",
					payload: parsed.data,
				});
				return;
			}
			onImportPermanent(parsed.data, false);
			return;
		}

		const buffer = await readExcelFile(file);
		const parsed = await parsePermanentExcel(buffer);
		if (!parsed.success) {
			if (parsed.error === "no_valid_rows") {
				toast.error(t("toast.noValidImportRows"));
				return;
			}
			toast.error(t("toast.invalidPermanentExcel"));
			return;
		}
		const skippedCount = parsed.skippedRows.length;
		if (hasPermanentImportData(data)) {
			onImportDialogChange({
				open: true,
				type: "permanent",
				payload: parsed.data,
				skippedRows: skippedCount,
			});
			return;
		}
		onImportPermanent(parsed.data, false, skippedCount);
	};

	const handleTempImport = async (file: File) => {
		if (format === "json") {
			const raw = await readJsonFile(file);
			const parsed = parseTempExport(raw);
			if (!parsed.success) {
				toast.error(t("toast.invalidTempJson"));
				return;
			}
			if (hasTempImportData(data)) {
				onImportDialogChange({
					open: true,
					type: "temp",
					payload: parsed.data,
				});
				return;
			}
			onImportTemp(parsed.data, false);
			return;
		}

		const buffer = await readExcelFile(file);
		const parsed = await parseTempExcel(buffer);
		if (!parsed.success) {
			if (parsed.error === "no_valid_rows") {
				toast.error(t("toast.noValidImportRows"));
				return;
			}
			toast.error(t("toast.invalidTempExcel"));
			return;
		}
		const skippedCount = parsed.skippedRows.length;
		if (hasTempImportData(data)) {
			onImportDialogChange({
				open: true,
				type: "temp",
				payload: parsed.data,
				skippedRows: skippedCount,
			});
			return;
		}
		onImportTemp(parsed.data, false, skippedCount);
	};

	const jsonAccept = ".json,application/json";
	const excelAccept =
		".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	return (
		<aside
			className={cn(
				"flex min-h-0 shrink-0 flex-col gap-4 overflow-y-auto border-[var(--color-border)] bg-[var(--color-muted)]/20",
				"w-full border-t p-[var(--layout-gutter)]",
				"xl:min-h-0 xl:w-[var(--layout-sidebar-right)] xl:overflow-y-auto xl:border-s xl:border-t-0 xl:p-4 xl:overscroll-contain 2xl:p-5",
			)}
			data-snippet-assist
		>
			<DataExportBox
				format={format}
				onFormatChange={setFormat}
				onDownloadPermanentTemplate={() =>
					void handleDownloadPermanentTemplate()
				}
				onDownloadTempTemplate={() => void handleDownloadTempTemplate()}
				onExportPermanent={() => void handlePermExport()}
				onImportPermanent={() =>
					format === "json"
						? permJsonInputRef.current?.click()
						: permExcelInputRef.current?.click()
				}
				onExportTemp={() => void handleTempExport()}
				onImportTemp={() =>
					format === "json"
						? tempJsonInputRef.current?.click()
						: tempExcelInputRef.current?.click()
				}
			/>

			<input
				ref={permJsonInputRef}
				type="file"
				accept={jsonAccept}
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) void handlePermImport(f);
					e.target.value = "";
				}}
			/>
			<input
				ref={tempJsonInputRef}
				type="file"
				accept={jsonAccept}
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) void handleTempImport(f);
					e.target.value = "";
				}}
			/>
			<input
				ref={permExcelInputRef}
				type="file"
				accept={excelAccept}
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) void handlePermImport(f);
					e.target.value = "";
				}}
			/>
			<input
				ref={tempExcelInputRef}
				type="file"
				accept={excelAccept}
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) void handleTempImport(f);
					e.target.value = "";
				}}
			/>

			<TestTypingDialog data={data} />

			<ImportOverwriteDialog
				importDialog={importDialog}
				onImportDialogChange={onImportDialogChange}
				onImportPermanent={onImportPermanent}
				onImportTemp={onImportTemp}
			/>
		</aside>
	);
}
