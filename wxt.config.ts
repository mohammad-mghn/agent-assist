import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import { resolve } from "node:path";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": resolve(import.meta.dirname ?? ".", "."),
			},
		},
	}),
	manifest: {
		name: "Agent Assist",
		description:
			"Text shortcuts with / and # triggers for textarea and contenteditable fields.",
		permissions: ["storage", "tabs", "downloads"],
		browser_specific_settings: {
			gecko: {
				id: "agent-assist@agent-assist.app",
				strict_min_version: "109.0",
			},
		},
		action: {
			default_title: "Agent Assist — active",
			default_icon: {
				16: "/favicon/favicon-16x16.png",
				32: "/favicon/favicon-32x32.png",
				48: "/favicon/android-chrome-192x192.png",
				128: "/favicon/android-chrome-192x192.png",
			},
		},
		icons: {
			16: "/favicon/favicon-16x16.png",
			32: "/favicon/favicon-32x32.png",
			48: "/favicon/android-chrome-192x192.png",
			128: "/favicon/android-chrome-192x192.png",
		},
	},
});
