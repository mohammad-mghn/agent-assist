import { getActionApi } from "@/lib/browser-action";
import { applyExtensionIcon } from "@/lib/extension-icon";
import { loadAppData, onAppDataChanged } from "@/lib/storage";
import { broadcastToTabs } from "@/lib/broadcast";
import { MESSAGE_DATA_CHANGED, MESSAGE_ICON_UPDATE } from "@/shared/constants";

const DASHBOARD_PATH = "/dashboard.html" as const;

async function syncIconFromStorage(): Promise<void> {
	const data = await loadAppData();
	await applyExtensionIcon(data.enabled);
}

async function broadcastDataChanged(): Promise<void> {
	await broadcastToTabs({ type: MESSAGE_DATA_CHANGED });
}

export default defineBackground(() => {
	void syncIconFromStorage();

	browser.runtime.onMessage.addListener((msg) => {
		if (msg?.type === MESSAGE_ICON_UPDATE && typeof msg.enabled === "boolean") {
			void applyExtensionIcon(msg.enabled);
		}
	});

	onAppDataChanged((data) => {
		void applyExtensionIcon(data.enabled);
		void broadcastDataChanged();
	});

	getActionApi().onClicked.addListener(async () => {
		const url = browser.runtime.getURL(DASHBOARD_PATH);
		const tabs = await browser.tabs.query({ url });
		if (tabs[0]?.id) {
			await browser.tabs.update(tabs[0].id, { active: true });
			if (tabs[0].windowId) {
				await browser.windows.update(tabs[0].windowId, { focused: true });
			}
			return;
		}
		await browser.tabs.create({ url });
	});

	browser.runtime.onInstalled.addListener(() => {
		void syncIconFromStorage();
	});

	browser.runtime.onStartup.addListener(() => {
		void syncIconFromStorage();
	});
});
