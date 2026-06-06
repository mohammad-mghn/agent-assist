import { randomCategoryColor, TEMP_CATEGORY_ID } from '../shared/constants';
import {
  permanentExportSchema,
  tempExportSchema,
} from '../shared/schemas';
import type {
  AppData,
  Category,
  ExportCategory,
  PermanentExport,
  TempExport,
} from '../shared/types';
import { downloadFile } from './download-file';
import { getPermanentShortcuts, getTempShortcuts } from './shortcut-index';

export function buildPermanentExport(data: AppData): PermanentExport {
  return {
    version: 1,
    type: 'permanent',
    categories: data.categories
      .filter((c) => c.id !== TEMP_CATEGORY_ID)
      .map(({ id, name }) => ({ id, name })),
    shortcuts: getPermanentShortcuts(data),
  };
}

export function categoriesWithRandomColors(
  categories: ExportCategory[],
): Category[] {
  return categories.map((category) => ({
    ...category,
    color: randomCategoryColor(),
  }));
}

export function buildTempExport(data: AppData): TempExport {
  return {
    version: 1,
    type: 'temp',
    shortcuts: getTempShortcuts(data),
  };
}

export async function downloadJson(
  filename: string,
  payload: unknown,
): Promise<void> {
  const text = JSON.stringify(payload, null, 2);
  await downloadFile(filename, text, 'application/json');
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
