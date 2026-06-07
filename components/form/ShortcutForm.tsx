import { SkipForward } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { CategorySelectField } from "@/components/form/CategorySelectField";
import { FormField } from "@/components/form/FormField";
import {
	MultilingualInput,
	MultilingualTextarea,
} from "@/components/form/MultilingualField";
import { ShortcutFormActions } from "@/components/form/ShortcutFormActions";
import { ShortcutFormHeader } from "@/components/form/ShortcutFormHeader";
import { ShortcutTriggerField } from "@/components/form/ShortcutTriggerField";
import { Button } from "@/components/ui/button";
import { useShortcutForm } from "@/hooks/use-shortcut-form";
import { useUiLocale } from "@/hooks/use-ui-locale";
import { getDefaultCategoryId } from "@/components/form/shortcut-form-utils";
import { insertJumpStopMarker } from "@/lib/jump-stop";
import { findDuplicateShortcut, triggerForKind } from "@/lib/shortcut-index";
import { TEMP_CATEGORY_ID } from "@/shared/constants";
import type { ShortcutFormValues } from "@/shared/schemas";
import type { AppData, Shortcut, ShortcutKind } from "@/shared/types";

interface ShortcutFormProps {
	data: AppData;
	editing: Shortcut | null;
	kind: ShortcutKind;
	onKindChange: (kind: ShortcutKind) => void;
	selectedCategoryId: string | null;
	formResetKey: number;
	onSubmit: (
		values: ShortcutFormValues,
		editingId?: string,
	) => void | Promise<void>;
	onCancel: () => void;
	onDelete?: (shortcut: Shortcut) => void;
	onNewCategory: () => void;
}

export function ShortcutForm({
	data,
	editing,
	kind,
	onKindChange,
	selectedCategoryId,
	formResetKey,
	onSubmit,
	onCancel,
	onDelete,
	onNewCategory,
}: ShortcutFormProps) {
	const { locale, t } = useUiLocale();
	const duplicateMessage = t("toast.shortcutExists");

	const {
		form,
		errors,
		isDirty,
		categoryId,
		shortcutError,
		duplicateShortcutError,
		handleKindChange,
		reset,
		setError,
	} = useShortcutForm({
		data,
		editing,
		kind,
		selectedCategoryId,
		formResetKey,
		locale,
		onKindChange,
		duplicateMessage,
	});

	const { control, handleSubmit: submitForm, setValue, watch } = form;
	const contentValue = watch("content");
	const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
	const contentSelectionRef = useRef({ start: 0, end: 0 });
	const pendingJumpStopSelectionRef = useRef<{
		start: number;
		end: number;
	} | null>(null);

	const syncContentSelection = (el: HTMLTextAreaElement) => {
		contentSelectionRef.current = {
			start: el.selectionStart ?? 0,
			end: el.selectionEnd ?? 0,
		};
	};

	useLayoutEffect(() => {
		const pending = pendingJumpStopSelectionRef.current;
		if (!pending) return;

		pendingJumpStopSelectionRef.current = null;
		const el = contentTextareaRef.current;
		if (!el) return;

		const applySelection = () => {
			if (!el.isConnected) return;
			el.focus({ preventScroll: true });
			el.selectionStart = pending.start;
			el.selectionEnd = pending.end;
			contentSelectionRef.current = pending;
		};

		applySelection();
		requestAnimationFrame(applySelection);
	}, [contentValue]);
	const triggerPrefix = triggerForKind(kind);
	const permanentCategories = data.categories.filter(
		(c) => c.id !== TEMP_CATEGORY_ID,
	);

	const handleSubmit = submitForm(async (values) => {
		if (findDuplicateShortcut(data, values.shortcut, kind, editing?.id)) {
			setError("shortcut", { message: duplicateMessage });
			return;
		}
		try {
			await onSubmit({ ...values, kind }, editing?.id);
		} catch {
			return;
		}
		reset({
			name: "",
			categoryId: selectedCategoryId ?? getDefaultCategoryId(data, kind),
			content: "",
			shortcut: "",
			kind,
		});
	});

	return (
		<form onSubmit={handleSubmit} className="space-y-4" data-snippet-assist>
			<ShortcutFormHeader
				kind={kind}
				editing={!!editing}
				onKindChange={handleKindChange}
			/>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<FormField
					label={t("form.name")}
					htmlFor="name"
					error={errors.name?.message}
				>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<MultilingualInput
								id="name"
								placeholder={t("form.namePlaceholder")}
								{...field}
							/>
						)}
					/>
				</FormField>

				<ShortcutTriggerField
					control={control}
					triggerPrefix={triggerPrefix}
					error={shortcutError}
				/>
			</div>

			{kind === "permanent" && (
				<CategorySelectField
					categoryId={categoryId}
					categories={permanentCategories}
					error={errors.categoryId?.message}
					onCategoryChange={(v) =>
						setValue("categoryId", v, { shouldDirty: true })
					}
					onNewCategory={onNewCategory}
				/>
			)}

			<FormField
				label={t("form.content")}
				htmlFor="content"
				hint={t("form.jumpStopHint")}
				error={errors.content?.message}
			>
				<Controller
					name="content"
					control={control}
					render={({ field: { ref: fieldRef, ...field } }) => (
						<div className="flex flex-col gap-2">
							<MultilingualTextarea
								ref={(el) => {
									contentTextareaRef.current = el;
									fieldRef(el);
								}}
								id="content"
								placeholder={t("form.contentPlaceholder")}
								rows={6}
								className="min-h-[8rem] xl:min-h-[10rem] 2xl:min-h-[12rem]"
								{...field}
								onSelect={(e) => {
									syncContentSelection(e.currentTarget);
								}}
								onKeyUp={(e) => {
									syncContentSelection(e.currentTarget);
								}}
								onClick={(e) => {
									syncContentSelection(e.currentTarget);
								}}
								onFocus={(e) => {
									syncContentSelection(e.currentTarget);
								}}
								onChange={(e) => {
									field.onChange(e);
									syncContentSelection(e.currentTarget);
								}}
							/>
							<div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onMouseDown={(e) => {
										e.preventDefault();
										const el = contentTextareaRef.current;
										if (el) syncContentSelection(el);
									}}
									onClick={() => {
										const el = contentTextareaRef.current;
										const current = field.value ?? "";
										const { start, end } = el
											? {
													start:
														el.selectionStart ??
														contentSelectionRef.current.start,
													end:
														el.selectionEnd ?? contentSelectionRef.current.end,
												}
											: contentSelectionRef.current;
										const { text, selectEnd } = insertJumpStopMarker(
											current,
											start,
											end,
										);
										pendingJumpStopSelectionRef.current = {
											start: selectEnd,
											end: selectEnd,
										};
										field.onChange(text);
									}}
								>
									<SkipForward className="h-4 w-4 shrink-0" />
									{t("form.addJumpStop")}
								</Button>
							</div>
						</div>
					)}
				/>
			</FormField>

			<ShortcutFormActions
				editing={!!editing}
				isDirty={isDirty}
				submitDisabled={(!isDirty && !!editing) || !!duplicateShortcutError}
				onCancel={() => {
					onCancel();
					reset();
				}}
				onDelete={
					editing && onDelete
						? () => {
								onDelete(editing);
								reset();
							}
						: undefined
				}
			/>
		</form>
	);
}
