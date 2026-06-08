import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadAppData, onAppDataChanged, saveAppData } from "@/lib/storage";
import type { AppData } from "@/shared/types";

export function useAppData() {
	const [data, setData] = useState<AppData | null>(null);

	const refresh = useCallback(async () => {
		setData(await loadAppData());
	}, []);

	useEffect(() => {
		void refresh();
		return onAppDataChanged(setData);
	}, [refresh]);

	const persist = useCallback(async (next: AppData, successMsg?: string) => {
		await saveAppData(next);
		setData(next);
		if (successMsg) toast.success(successMsg);
	}, []);

	return { data, setData, refresh, persist };
}
