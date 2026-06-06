import { useState } from "react";
import { Keyboard } from "lucide-react";
import {
	Dialog,
	DialogCloseButton,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SidebarCopyright } from "@/components/sidebar/right/SidebarCopyright";
import { TestTextarea } from "@/components/sidebar/right/TestTextarea";
import { useUiLocale } from "@/hooks/use-ui-locale";
import type { AppData } from "@/shared/types";

interface TestTypingDialogProps {
	data: AppData;
}

export function TestTypingDialog({ data }: TestTypingDialogProps) {
	const { dir, t } = useUiLocale();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="w-full shrink-0 cursor-pointer gap-2 text-sm"
				onClick={() => setOpen(true)}
			>
				<Keyboard className="h-4 w-4" />
				{t("right.testTitle")}
			</Button>

			<SidebarCopyright />

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent dir={dir} className="w-[min(100%-2rem,40rem)] max-w-2xl">
					<DialogHeader>
						<div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
							<DialogTitle className="flex-1 pe-2 text-start">
								{t("right.testTitle")}
							</DialogTitle>
							<DialogCloseButton />
						</div>
						<DialogDescription className="pt-1">
							{t("right.testHint")}
						</DialogDescription>
					</DialogHeader>
					{open ? <TestTextarea data={data} autoFocus /> : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
