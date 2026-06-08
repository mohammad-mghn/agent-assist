type ActionApi = {
	onClicked: {
		addListener: (callback: (...args: unknown[]) => void) => void;
	};
	setIcon: (details: { path: Record<number, string> }) => Promise<void>;
	setTitle: (details: { title: string }) => Promise<void>;
	setBadgeText: (details: { text: string }) => Promise<void>;
	setBadgeBackgroundColor: (details: { color: string }) => Promise<void>;
};

/**
 * Resolves the toolbar action API across manifest versions/browsers.
 *
 * MV3 (Chrome) exposes `browser.action`, while MV2 (Firefox) only exposes
 * `browser.browserAction`. Accessing the missing one throws and would crash the
 * background script, so we pick whichever exists at runtime.
 */
export function getActionApi(): ActionApi {
	const api =
		(browser as unknown as { action?: ActionApi }).action ??
		(browser as unknown as { browserAction?: ActionApi }).browserAction;

	if (!api) {
		throw new Error("No browser action API available (action/browserAction).");
	}

	return api;
}
