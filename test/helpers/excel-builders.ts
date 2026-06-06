import ExcelJS from 'exceljs/dist/exceljs.min.js';

const PERMANENT_SHEET = 'Permanent (slash)';
const TEMP_SHEET = 'Temp (#)';

const PERM_SPACER_COUNT = 5;
const PERM = {
  catName: 1,
  scName: 2 + PERM_SPACER_COUNT,
  scTrigger: 3 + PERM_SPACER_COUNT,
  scContent: 4 + PERM_SPACER_COUNT,
  scCategory: 5 + PERM_SPACER_COUNT,
};

const TEMP = {
  scName: 1,
  scTrigger: 2,
  scContent: 3,
};

export async function buildPermanentExcelBuffer(
  rows: Array<{
    categoryName?: string;
    displayName?: string;
    shortcut?: string;
    content?: string;
    category?: string;
  }>,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(PERMANENT_SHEET);

  const header = sheet.getRow(1);
  header.getCell(PERM.catName).value = 'Category Name';
  header.getCell(PERM.scName).value = 'Display Name';
  header.getCell(PERM.scTrigger).value = 'Shortcut';
  header.getCell(PERM.scContent).value = 'Insert Text';
  header.getCell(PERM.scCategory).value = 'Category';

  rows.forEach((row, index) => {
    const excelRow = sheet.getRow(index + 2);
    if (row.categoryName != null) {
      excelRow.getCell(PERM.catName).value = row.categoryName;
    }
    if (row.displayName != null) {
      excelRow.getCell(PERM.scName).value = row.displayName;
    }
    if (row.shortcut != null) {
      excelRow.getCell(PERM.scTrigger).value = row.shortcut;
    }
    if (row.content != null) {
      excelRow.getCell(PERM.scContent).value = row.content;
    }
    if (row.category != null) {
      excelRow.getCell(PERM.scCategory).value = row.category;
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer instanceof ArrayBuffer
    ? buffer
    : new Uint8Array(buffer as ArrayLike<number>).buffer;
}

export async function buildTempExcelBuffer(
  rows: Array<{
    displayName?: string;
    shortcut?: string;
    content?: string;
  }>,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(TEMP_SHEET);

  const header = sheet.getRow(1);
  header.getCell(TEMP.scName).value = 'Display Name';
  header.getCell(TEMP.scTrigger).value = 'Shortcut';
  header.getCell(TEMP.scContent).value = 'Insert Text';

  rows.forEach((row, index) => {
    const excelRow = sheet.getRow(index + 2);
    if (row.displayName != null) {
      excelRow.getCell(TEMP.scName).value = row.displayName;
    }
    if (row.shortcut != null) {
      excelRow.getCell(TEMP.scTrigger).value = row.shortcut;
    }
    if (row.content != null) {
      excelRow.getCell(TEMP.scContent).value = row.content;
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer instanceof ArrayBuffer
    ? buffer
    : new Uint8Array(buffer as ArrayLike<number>).buffer;
}

export async function buildInvalidExcelBuffer(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Wrong');
  sheet.getRow(1).getCell(1).value = 'Not a valid import sheet';
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer instanceof ArrayBuffer
    ? buffer
    : new Uint8Array(buffer as ArrayLike<number>).buffer;
}
