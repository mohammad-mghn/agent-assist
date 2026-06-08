import { getActionApi } from "@/lib/browser-action";
import { MESSAGE_ICON_UPDATE } from "../shared/constants";

const ICON_SIZES = [16, 32, 48, 128] as const;

const EXTENSION_ICON_PATHS: Record<(typeof ICON_SIZES)[number], string> = {
	16: "/favicon/favicon-16x16.png",
	32: "/favicon/favicon-32x32.png",
	48: "/favicon/android-chrome-192x192.png",
	128: "/favicon/android-chrome-192x192.png",
};

function iconPathsForEnabled(_enabled: boolean): Record<number, string> {
	return Object.fromEntries(
		ICON_SIZES.map((size) => [
			size,
			browser.runtime.getURL(EXTENSION_ICON_PATHS[size]),
		]),
	);
}

export async function applyExtensionIcon(enabled: boolean): Promise<void> {
	const action = getActionApi();
	await action.setIcon({ path: iconPathsForEnabled(enabled) });
	await action.setTitle({
		title: enabled ? "Agent Assist — active" : "Agent Assist — disabled",
	});
	await action.setBadgeText({ text: enabled ? "" : "OFF" });
	await action.setBadgeBackgroundColor({
		color: enabled ? "#22c55e" : "#ef4444",
	});
}

export async function requestExtensionIconUpdate(
	enabled: boolean,
): Promise<void> {
	try {
		await browser.runtime.sendMessage({
			type: MESSAGE_ICON_UPDATE,
			enabled,
		});
	} catch {
		return;
	}
}
