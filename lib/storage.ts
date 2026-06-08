import { STORAGE_KEY_LOCAL, STORAGE_KEY_SYNC_META } from "@/shared/constants";
import { appDataSchema } from "@/shared/schemas";
import type { AppData, SyncMeta } from "@/shared/types";
import { createDefaultAppData } from "@/lib/default-data";
import { requestExtensionIconUpdate } from "@/lib/extension-icon";
import { ensureTempCategory, writeSyncMeta } from "@/lib/storage/normalize";

export async function loadAppData(): Promise<AppData> {
	const localResult = await browser.storage.local.get(STORAGE_KEY_LOCAL);
	const raw = localResult[STORAGE_KEY_LOCAL];

	if (raw) {
		const parsed = appDataSchema.safeParse(raw);
		if (parsed.success) {
			return ensureTempCategory(parsed.data as AppData);
		}
	}

	const syncResult = await browser.storage.sync.get([
		STORAGE_KEY_SYNC_META,
		"enabled",
	]);
	const syncMeta = syncResult[STORAGE_KEY_SYNC_META] as SyncMeta | undefined;

	if (syncMeta?.version === 1) {
		const fallback = createDefaultAppData();
		fallback.enabled =
			typeof syncResult.enabled === "boolean"
				? syncResult.enabled
				: syncMeta.enabled;
		fallback.dropdownEnabled = syncMeta.dropdownEnabled ?? true;
		fallback.savedDropdownEnabled =
			syncMeta.savedDropdownEnabled ?? syncMeta.dropdownEnabled ?? true;
		fallback.categories = syncMeta.categories.length
			? syncMeta.categories
			: fallback.categories;
		await saveAppData(fallback);
		return fallback;
	}

	const initial = createDefaultAppData();
	await saveAppData(initial);
	return initial;
}

export async function saveAppData(data: AppData): Promise<void> {
	const validated = appDataSchema.parse(ensureTempCategory(data)) as AppData;
	await browser.storage.local.set({ [STORAGE_KEY_LOCAL]: validated });
	await writeSyncMeta(validated);
	await requestExtensionIconUpdate(validated.enabled);
}

export async function setEnabled(enabled: boolean): Promise<AppData> {
	const data = await loadAppData();

	if (!enabled) {
		const next = {
			...data,
			enabled: false,
			savedDropdownEnabled: data.dropdownEnabled,
			dropdownEnabled: false,
		};
		await saveAppData(next);
		return next;
	}

	const next = {
		...data,
		enabled: true,
		dropdownEnabled: data.savedDropdownEnabled,
	};
	await saveAppData(next);
	return next;
}

export async function setDropdownEnabled(
	dropdownEnabled: boolean,
): Promise<AppData> {
	const data = await loadAppData();
	const next = { ...data, dropdownEnabled };
	await saveAppData(next);
	return next;
}

export async function clearCategoriesData(): Promise<AppData> {
	const data = await loadAppData();
	const defaults = createDefaultAppData();
	const next: AppData = {
		...data,
		categories: defaults.categories,
		shortcuts: [],
	};
	await saveAppData(next);
	return next;
}

export function onAppDataChanged(
	callback: (data: AppData) => void,
): () => void {
	const listener = (
		changes: Record<string, Browser.storage.StorageChange>,
		area: string,
	) => {
		if (area !== "local" && area !== "sync") return;
		if (
			changes[STORAGE_KEY_LOCAL] ||
			changes[STORAGE_KEY_SYNC_META] ||
			changes.enabled
		) {
			void loadAppData().then(callback);
		}
	};
	browser.storage.onChanged.addListener(listener);
	return () => browser.storage.onChanged.removeListener(listener);
}
