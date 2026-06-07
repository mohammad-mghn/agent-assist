import { TEMP_CATEGORY_ID } from "../shared/constants";
import type { AppData, Category, Shortcut, TriggerChar } from "../shared/types";

export interface DropdownItem {
	shortcut: Shortcut;
	category: Category;
	trigger: TriggerChar;
	query: string;
}

export function triggerForKind(kind: Shortcut["kind"]): TriggerChar {
	return kind === "temp" ? "#" : "/";
}

export function filterShortcuts(
	data: AppData,
	trigger: TriggerChar,
	query: string,
): DropdownItem[] {
	const q = query.toLowerCase();
	const items: DropdownItem[] = [];

	for (const shortcut of data.shortcuts) {
		const t = triggerForKind(shortcut.kind);
		if (t !== trigger) continue;
		if (q && !shortcut.shortcut.toLowerCase().startsWith(q)) continue;

		const category =
			data.categories.find((c) => c.id === shortcut.categoryId) ??
			data.categories.find((c) => c.id === TEMP_CATEGORY_ID)!;

		items.push({ shortcut, category, trigger: t, query: q });
	}

	items.sort((a, b) => a.shortcut.name.localeCompare(b.shortcut.name));
	return items;
}

export function findExactShortcut(
	data: AppData,
	trigger: TriggerChar,
	token: string,
): Shortcut | undefined {
	const normalized = token.toLowerCase();
	return data.shortcuts.find(
		(s) =>
			triggerForKind(s.kind) === trigger &&
			s.shortcut.toLowerCase() === normalized,
	);
}

export function findDuplicateShortcut(
	data: AppData,
	shortcut: string,
	kind: Shortcut["kind"],
	excludeId?: string,
): Shortcut | undefined {
	const normalized = shortcut.toLowerCase();
	return data.shortcuts.find(
		(s) =>
			s.kind === kind &&
			s.id !== excludeId &&
			s.shortcut.toLowerCase() === normalized,
	);
}

const SHORTCUT_MAX_LEN = 40;
const UNICODE_SHORTCUT_RE = /^[\p{L}\p{M}_-]+$/u;

function letterSuffix(index: number): string {
	let i = index;
	let suffix = "";
	while (true) {
		suffix = String.fromCharCode(97 + (i % 26)) + suffix;
		i = Math.floor(i / 26) - 1;
		if (i < 0) break;
	}
	return suffix;
}

function uniqueShortcutToken(base: string, used: Set<string>): string {
	const normalized = base.toLowerCase();
	if (!used.has(normalized)) {
		used.add(normalized);
		return base;
	}

	for (let i = 0; ; i++) {
		const suffix = `-${letterSuffix(i)}`;
		const maxBase = SHORTCUT_MAX_LEN - suffix.length;
		const truncated = base.slice(0, Math.max(1, maxBase));
		const candidate = `${truncated}${suffix}`;
		const candidateNorm = candidate.toLowerCase();
		if (
			!used.has(candidateNorm) &&
			candidate.length <= SHORTCUT_MAX_LEN &&
			UNICODE_SHORTCUT_RE.test(candidate)
		) {
			used.add(candidateNorm);
			return candidate;
		}
	}
}

export function dedupeImportedShortcuts(
	incoming: Shortcut[],
	existing: Shortcut[] = [],
): Shortcut[] {
	const usedByKind = new Map<Shortcut["kind"], Set<string>>();

	const getUsed = (kind: Shortcut["kind"]) => {
		let set = usedByKind.get(kind);
		if (!set) {
			set = new Set();
			usedByKind.set(kind, set);
		}
		return set;
	};

	for (const shortcut of existing) {
		getUsed(shortcut.kind).add(shortcut.shortcut.toLowerCase());
	}

	return incoming.map((shortcut) => {
		const unique = uniqueShortcutToken(shortcut.shortcut, getUsed(shortcut.kind));
		return unique === shortcut.shortcut
			? shortcut
			: { ...shortcut, shortcut: unique };
	});
}

export function getPermanentShortcuts(data: AppData): Shortcut[] {
	return data.shortcuts.filter((s) => s.kind === "permanent");
}

export function getTempShortcuts(data: AppData): Shortcut[] {
	return data.shortcuts.filter((s) => s.kind === "temp");
}

export function getCategoriesForSidebar(data: AppData): Category[] {
	return data.categories.filter((c) => c.id !== TEMP_CATEGORY_ID);
}
