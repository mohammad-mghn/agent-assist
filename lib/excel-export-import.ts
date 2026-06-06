import ExcelJS from 'exceljs/dist/exceljs.min.js';
import { TEMP_CATEGORY_ID } from '../shared/constants';
import {
  exportCategorySchema,
  permanentExportSchema,
  sanitizeShortcutToken,
  shortcutSchema,
  tempExportSchema,
} from '../shared/schemas';
import type {
  AppData,
  ExportCategory,
  PermanentExport,
  Shortcut,
  TempExport,
} from '../shared/types';
import { downloadFile } from './download-file';
import { getPermanentShortcuts, getTempShortcuts } from './shortcut-index';
import { generateId } from './utils';

const PERMANENT_SHEET = 'Permanent (slash)';
const TEMP_SHEET = 'Temp (#)';

const LEGACY_PERMANENT_SHEETS = ['Permanent (/)', 'Permanent'];

const PERM_SPACER_COUNT = 5;

type PermanentColumns = {
  catName: number;
  spacerStart: number;
  scName: number;
  scTrigger: number;
  scContent: number;
  scCategory: number;
};

const PERM: PermanentColumns = {
  catName: 1,
  spacerStart: 2,
  scName: 2 + PERM_SPACER_COUNT,
  scTrigger: 3 + PERM_SPACER_COUNT,
  scContent: 4 + PERM_SPACER_COUNT,
  scCategory: 5 + PERM_SPACER_COUNT,
};

const LEGACY_PERM: PermanentColumns = {
  catName: 1,
  spacerStart: 3,
  scName: 3 + PERM_SPACER_COUNT,
  scTrigger: 4 + PERM_SPACER_COUNT,
  scContent: 5 + PERM_SPACER_COUNT,
  scCategory: 6 + PERM_SPACER_COUNT,
};

const TEMP = {
  scName: 1,
  scTrigger: 2,
  scContent: 3,
} as const;

export type SkippedImportReason =
  | 'missing_name'
  | 'missing_category'
  | 'unknown_category'
  | 'missing_shortcut'
  | 'missing_content'
  | 'invalid_shortcut'
  | 'invalid_row';

export type SkippedImportRow = {
  row: number;
  reason: SkippedImportReason;
};

export type ExcelParseResult<T> =
  | { success: true; data: T; skippedRows: SkippedImportRow[] }
  | {
      success: false;
      error: 'missing_sheet' | 'invalid_file' | 'no_valid_rows';
      skippedRows?: SkippedImportRow[];
    };

function normalizeDisplayText(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCategoryKey(name: string): string {
  return normalizeDisplayText(name).toLowerCase();
}

function permanentColumnsForSheet(sheet: ExcelJS.Worksheet): PermanentColumns {
  const header = sheet.getRow(1);
  if (headerMatches(header.getCell(2), 'Color')) {
    return LEGACY_PERM;
  }
  return PERM;
}

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null) return '';
  if (typeof value === 'string') return normalizeDisplayText(value);
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (typeof value === 'object' && value !== null && 'text' in value) {
    return String((value as { text: string }).text).trim();
  }
  if (typeof value === 'object' && value !== null && 'richText' in value) {
    const rich = (value as { richText: Array<{ text: string }> }).richText;
    return rich.map((part) => part.text).join('').trim();
  }
  return String(value).trim();
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.alignment = { vertical: 'middle', wrapText: true };
}

function setSpacerColumns(sheet: ExcelJS.Worksheet, startCol: number, count: number): void {
  for (let col = startCol; col < startCol + count; col++) {
    sheet.getColumn(col).width = 3;
  }
}

async function writeWorkbook(
  configure: (workbook: ExcelJS.Workbook) => void,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  configure(workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  if (buffer instanceof ArrayBuffer) return buffer;
  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
  }
  return new Uint8Array(buffer as ArrayLike<number>).buffer;
}

function addPermanentSheet(
  workbook: ExcelJS.Workbook,
  categories: ExportCategory[],
  shortcuts: Shortcut[],
): void {
  const sheet = workbook.addWorksheet(PERMANENT_SHEET);
  sheet.getColumn(PERM.catName).width = 18;
  setSpacerColumns(sheet, PERM.spacerStart, PERM_SPACER_COUNT);
  sheet.getColumn(PERM.scName).width = 20;
  sheet.getColumn(PERM.scTrigger).width = 14;
  sheet.getColumn(PERM.scContent).width = 36;
  sheet.getColumn(PERM.scCategory).width = 18;

  const header = sheet.getRow(1);
  header.getCell(PERM.catName).value = 'Category Name';
  header.getCell(PERM.scName).value = 'Display Name';
  header.getCell(PERM.scTrigger).value = 'Shortcut';
  header.getCell(PERM.scContent).value = 'Insert Text';
  header.getCell(PERM.scCategory).value = 'Category';
  styleHeaderRow(header);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const rowCount = Math.max(categories.length, shortcuts.length, 0);

  for (let i = 0; i < rowCount; i++) {
    const row = sheet.getRow(i + 2);
    const category = categories[i];
    if (category) {
      row.getCell(PERM.catName).value = category.name;
    }
    const shortcut = shortcuts[i];
    if (shortcut) {
      row.getCell(PERM.scName).value = shortcut.name;
      row.getCell(PERM.scTrigger).value = shortcut.shortcut;
      row.getCell(PERM.scContent).value = shortcut.content;
      const cat = categoryById.get(shortcut.categoryId);
      row.getCell(PERM.scCategory).value = cat?.name ?? shortcut.categoryId;
    }
  }
}

function addTempSheet(workbook: ExcelJS.Workbook, shortcuts: Shortcut[]): void {
  const sheet = workbook.addWorksheet(TEMP_SHEET);
  sheet.getColumn(TEMP.scName).width = 20;
  sheet.getColumn(TEMP.scTrigger).width = 14;
  sheet.getColumn(TEMP.scContent).width = 36;

  const header = sheet.getRow(1);
  header.getCell(TEMP.scName).value = 'Display Name';
  header.getCell(TEMP.scTrigger).value = 'Shortcut';
  header.getCell(TEMP.scContent).value = 'Insert Text';
  styleHeaderRow(header);

  shortcuts.forEach((shortcut, index) => {
    const row = sheet.getRow(index + 2);
    row.getCell(TEMP.scName).value = shortcut.name;
    row.getCell(TEMP.scTrigger).value = shortcut.shortcut;
    row.getCell(TEMP.scContent).value = shortcut.content;
  });
}

export async function buildPermanentExcel(data: AppData): Promise<ArrayBuffer> {
  const categories = data.categories.filter((c) => c.id !== TEMP_CATEGORY_ID);
  const shortcuts = getPermanentShortcuts(data);
  return writeWorkbook((workbook) => {
    addPermanentSheet(workbook, categories, shortcuts);
  });
}

export async function buildTempExcel(data: AppData): Promise<ArrayBuffer> {
  const shortcuts = getTempShortcuts(data);
  return writeWorkbook((workbook) => {
    addTempSheet(workbook, shortcuts);
  });
}

export async function buildPermanentExcelTemplate(): Promise<ArrayBuffer> {
  return writeWorkbook((workbook) => {
    addPermanentSheet(
      workbook,
      [{ id: 'example', name: 'SQL DB' }],
      [
        {
          id: 'example-sc',
          name: 'Reply email',
          shortcut: 'reply',
          content: 'Thank you for your message.',
          categoryId: 'example',
          kind: 'permanent',
        },
      ],
    );
  });
}

export async function buildTempExcelTemplate(): Promise<ArrayBuffer> {
  return writeWorkbook((workbook) => {
    addTempSheet(workbook, [
      {
        id: 'example-temp',
        name: 'Quick note',
        shortcut: 'note',
        content: 'Remember to follow up.',
        categoryId: TEMP_CATEGORY_ID,
        kind: 'temp',
      },
    ]);
  });
}

export async function downloadExcel(
  filename: string,
  buffer: ArrayBuffer,
): Promise<void> {
  await downloadFile(
    filename,
    buffer,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}

export async function readExcelFile(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

function sheetMaxRow(sheet: ExcelJS.Worksheet): number {
  return Math.max(sheet.rowCount, sheet.lastRow?.number ?? 0, 1);
}

function readPermanentCategories(
  sheet: ExcelJS.Worksheet,
  columns: PermanentColumns,
): {
  categories: ExportCategory[];
  skippedRows: SkippedImportRow[];
} {
  const categories: ExportCategory[] = [];
  const skippedRows: SkippedImportRow[] = [];
  const maxRow = sheetMaxRow(sheet);

  for (let rowIndex = 2; rowIndex <= maxRow; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    const name = cellText(row.getCell(columns.catName));
    if (!name) continue;

    const candidate: ExportCategory = {
      id: generateId(),
      name,
    };
    const parsed = exportCategorySchema.safeParse(candidate);
    if (!parsed.success) {
      skippedRows.push({ row: rowIndex, reason: 'invalid_row' });
      continue;
    }
    categories.push(parsed.data);
  }
  return { categories, skippedRows };
}

function readPermanentShortcuts(
  sheet: ExcelJS.Worksheet,
  categories: ExportCategory[],
  columns: PermanentColumns,
): {
  shortcuts: Shortcut[];
  skippedRows: SkippedImportRow[];
} {
  const nameToId = new Map(
    categories.map((c) => [normalizeCategoryKey(c.name), c.id]),
  );
  const shortcuts: Shortcut[] = [];
  const skippedRows: SkippedImportRow[] = [];
  const maxRow = sheetMaxRow(sheet);

  for (let rowIndex = 2; rowIndex <= maxRow; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    const name = cellText(row.getCell(columns.scName));
    if (!name) continue;

    const trigger = cellText(row.getCell(columns.scTrigger));
    const content = cellText(row.getCell(columns.scContent));
    const categoryName = cellText(row.getCell(columns.scCategory));

    if (!categoryName) {
      skippedRows.push({ row: rowIndex, reason: 'missing_category' });
      continue;
    }
    if (!trigger) {
      skippedRows.push({ row: rowIndex, reason: 'missing_shortcut' });
      continue;
    }
    if (!content) {
      skippedRows.push({ row: rowIndex, reason: 'missing_content' });
      continue;
    }

    const categoryKey = normalizeCategoryKey(categoryName);
    const categoryId = nameToId.get(categoryKey);
    if (!categoryId) {
      skippedRows.push({ row: rowIndex, reason: 'unknown_category' });
      continue;
    }

    const candidate: Shortcut = {
      id: generateId(),
      name,
      shortcut: sanitizeShortcutToken(trigger),
      content,
      categoryId,
      kind: 'permanent',
    };
    const parsed = shortcutSchema.safeParse(candidate);
    if (!parsed.success) {
      skippedRows.push({ row: rowIndex, reason: 'invalid_shortcut' });
      continue;
    }
    shortcuts.push(parsed.data);
  }

  return { shortcuts, skippedRows };
}

function readTempShortcuts(sheet: ExcelJS.Worksheet): {
  shortcuts: Shortcut[];
  skippedRows: SkippedImportRow[];
} {
  const shortcuts: Shortcut[] = [];
  const skippedRows: SkippedImportRow[] = [];
  const maxRow = sheetMaxRow(sheet);

  for (let rowIndex = 2; rowIndex <= maxRow; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    const name = cellText(row.getCell(TEMP.scName));
    if (!name) continue;

    const trigger = cellText(row.getCell(TEMP.scTrigger));
    const content = cellText(row.getCell(TEMP.scContent));

    if (!trigger) {
      skippedRows.push({ row: rowIndex, reason: 'missing_shortcut' });
      continue;
    }
    if (!content) {
      skippedRows.push({ row: rowIndex, reason: 'missing_content' });
      continue;
    }

    const candidate: Shortcut = {
      id: generateId(),
      name,
      shortcut: sanitizeShortcutToken(trigger),
      content,
      categoryId: TEMP_CATEGORY_ID,
      kind: 'temp',
    };
    const parsed = shortcutSchema.safeParse(candidate);
    if (!parsed.success) {
      skippedRows.push({ row: rowIndex, reason: 'invalid_shortcut' });
      continue;
    }
    shortcuts.push(parsed.data);
  }
  return { shortcuts, skippedRows };
}

async function loadWorkbook(buffer: ArrayBuffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function headerMatches(cell: ExcelJS.Cell, expected: string): boolean {
  return normalizeDisplayText(cellText(cell)).toLowerCase() === expected.toLowerCase();
}

function isPermanentHeaderRow(
  sheet: ExcelJS.Worksheet,
  columns: PermanentColumns,
): boolean {
  const header = sheet.getRow(1);
  return (
    headerMatches(header.getCell(columns.catName), 'Category Name') &&
    headerMatches(header.getCell(columns.scName), 'Display Name') &&
    headerMatches(header.getCell(columns.scTrigger), 'Shortcut') &&
    headerMatches(header.getCell(columns.scContent), 'Insert Text') &&
    headerMatches(header.getCell(columns.scCategory), 'Category')
  );
}

function isTempHeaderRow(sheet: ExcelJS.Worksheet): boolean {
  const header = sheet.getRow(1);
  return (
    headerMatches(header.getCell(TEMP.scName), 'Display Name') &&
    headerMatches(header.getCell(TEMP.scTrigger), 'Shortcut') &&
    headerMatches(header.getCell(TEMP.scContent), 'Insert Text') &&
    !headerMatches(header.getCell(PERM.catName), 'Category Name')
  );
}

function findSheetByHeader(
  workbook: ExcelJS.Workbook,
  matchesHeader: (sheet: ExcelJS.Worksheet) => boolean,
): ExcelJS.Worksheet | undefined {
  for (const sheet of workbook.worksheets) {
    if (matchesHeader(sheet)) return sheet;
  }
  return undefined;
}

function findPermanentSheet(
  workbook: ExcelJS.Workbook,
): ExcelJS.Worksheet | undefined {
  const current = workbook.getWorksheet(PERMANENT_SHEET);
  if (current && isPermanentHeaderRow(current, permanentColumnsForSheet(current))) {
    return current;
  }
  for (const name of LEGACY_PERMANENT_SHEETS) {
    const sheet = workbook.getWorksheet(name);
    if (sheet && isPermanentHeaderRow(sheet, permanentColumnsForSheet(sheet))) {
      return sheet;
    }
  }
  for (const sheet of workbook.worksheets) {
    const columns = permanentColumnsForSheet(sheet);
    if (isPermanentHeaderRow(sheet, columns)) return sheet;
  }
  return undefined;
}

function getTempSheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet | undefined {
  const current = workbook.getWorksheet(TEMP_SHEET);
  if (current) return current;
  return findSheetByHeader(workbook, isTempHeaderRow);
}

export async function parsePermanentExcel(
  buffer: ArrayBuffer,
): Promise<ExcelParseResult<PermanentExport>> {
  try {
    const workbook = await loadWorkbook(buffer);
    const sheet = findPermanentSheet(workbook);
    if (!sheet) {
      return { success: false, error: 'missing_sheet' };
    }
    const columns = permanentColumnsForSheet(sheet);
    const { categories, skippedRows: skippedCategories } =
      readPermanentCategories(sheet, columns);
    const {
      shortcuts,
      skippedRows: skippedShortcuts,
    } = readPermanentShortcuts(sheet, categories, columns);
    const skippedRows = [...skippedCategories, ...skippedShortcuts];

    const hasValidData = categories.length > 0 || shortcuts.length > 0;
    if (!hasValidData && skippedRows.length > 0) {
      return { success: false, error: 'no_valid_rows', skippedRows };
    }

    const payload: PermanentExport = {
      version: 1,
      type: 'permanent',
      categories,
      shortcuts,
    };
    const validated = permanentExportSchema.safeParse(payload);
    if (!validated.success) {
      return { success: false, error: 'invalid_file', skippedRows };
    }
    return { success: true, data: validated.data, skippedRows };
  } catch {
    return { success: false, error: 'invalid_file' };
  }
}

export async function parseTempExcel(
  buffer: ArrayBuffer,
): Promise<ExcelParseResult<TempExport>> {
  try {
    const workbook = await loadWorkbook(buffer);
    const sheet = getTempSheet(workbook);
    if (!sheet) {
      return { success: false, error: 'missing_sheet' };
    }
    const { shortcuts, skippedRows } = readTempShortcuts(sheet);

    if (shortcuts.length === 0 && skippedRows.length > 0) {
      return { success: false, error: 'no_valid_rows', skippedRows };
    }

    const payload: TempExport = {
      version: 1,
      type: 'temp',
      shortcuts,
    };
    const validated = tempExportSchema.safeParse(payload);
    if (!validated.success) {
      return { success: false, error: 'invalid_file', skippedRows };
    }
    return { success: true, data: validated.data, skippedRows };
  } catch {
    return { success: false, error: 'invalid_file' };
  }
}

export function buildPermanentJsonTemplate(): PermanentExport {
  return {
    version: 1,
    type: 'permanent',
    categories: [{ id: 'sql-db', name: 'SQL DB' }],
    shortcuts: [
      {
        id: 'reply',
        name: 'Reply email',
        shortcut: 'reply',
        content: 'Thank you for your message.',
        categoryId: 'sql-db',
        kind: 'permanent',
      },
    ],
  };
}

export function buildTempJsonTemplate(): TempExport {
  return {
    version: 1,
    type: 'temp',
    shortcuts: [
      {
        id: 'note',
        name: 'Quick note',
        shortcut: 'note',
        content: 'Remember to follow up.',
        categoryId: TEMP_CATEGORY_ID,
        kind: 'temp',
      },
    ],
  };
}
