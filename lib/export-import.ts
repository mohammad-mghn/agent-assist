import { TEMP_CATEGORY_ID } from '../shared/constants';
import {
  permanentExportSchema,
  tempExportSchema,
} from '../shared/schemas';
import type { AppData, PermanentExport, TempExport } from '../shared/types';
import { getPermanentShortcuts, getTempShortcuts } from './shortcut-index';

export function buildPermanentExport(data: AppData): PermanentExport {
  return {
    version: 1,
    type: 'permanent',
    categories: data.categories.filter((c) => c.id !== TEMP_CATEGORY_ID),
    shortcuts: getPermanentShortcuts(data),
  };
}

export function buildTempExport(data: AppData): TempExport {
  return {
    version: 1,
    type: 'temp',
    shortcuts: getTempShortcuts(data),
  };
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}

export function parsePermanentExport(raw: unknown) {
  return permanentExportSchema.safeParse(raw);
}

export function parseTempExport(raw: unknown) {
  return tempExportSchema.safeParse(raw);
}

export function hasPermanentImportData(data: AppData): boolean {
  const hasCategories = data.categories.some((c) => c.id !== TEMP_CATEGORY_ID);
  const hasShortcuts = data.shortcuts.some((s) => s.kind === 'permanent');
  return hasCategories || hasShortcuts;
}

export function hasTempImportData(data: AppData): boolean {
  return data.shortcuts.some((s) => s.kind === 'temp');
}
