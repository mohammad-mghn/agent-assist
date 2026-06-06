import { describe, expect, it } from 'vitest';
import { parsePermanentExport, parseTempExport } from '@/lib/export-import';
import { parsePermanentExcel, parseTempExcel } from '@/lib/excel-export-import';
import {
  createPermanentExportPayload,
  createTempExportPayload,
} from '@/test/fixtures/app-data';
import {
  buildInvalidExcelBuffer,
  buildPermanentExcelBuffer,
  buildTempExcelBuffer,
} from '@/test/helpers/excel-builders';

describe('invalid import data handling', () => {
  describe('JSON permanent imports', () => {
    const badPayloads = [
      { label: 'categories as string', value: { ...createPermanentExportPayload(), categories: 'bad' } },
      { label: 'shortcut missing name', value: {
        ...createPermanentExportPayload(),
        shortcuts: [{ ...createPermanentExportPayload().shortcuts[0]!, name: '' }],
      }},
      { label: 'category name too long', value: {
        ...createPermanentExportPayload(),
        categories: [{ id: 'c', name: 'x'.repeat(51) }],
      }},
      { label: 'invalid kind', value: {
        ...createPermanentExportPayload(),
        shortcuts: [{ ...createPermanentExportPayload().shortcuts[0]!, kind: 'weekly' }],
      }},
    ];

    it.each(badPayloads)('rejects $label', ({ value }) => {
      expect(parsePermanentExport(value).success).toBe(false);
    });
  });

  describe('JSON temp imports', () => {
    const badPayloads = [
      { label: 'wrong export type', value: { ...createTempExportPayload(), type: 'permanent' } },
      { label: 'empty shortcuts array with invalid entry shape', value: {
        version: 1,
        type: 'temp',
        shortcuts: [{ id: '', name: '', shortcut: '', content: '', categoryId: '', kind: 'temp' }],
      }},
      { label: 'shortcut with spaces', value: {
        ...createTempExportPayload(),
        shortcuts: [{ ...createTempExportPayload().shortcuts[0]!, shortcut: 'bad token' }],
      }},
    ];

    it.each(badPayloads)('rejects $label', ({ value }) => {
      expect(parseTempExport(value).success).toBe(false);
    });
  });

  describe('Excel permanent imports', () => {
    it('rejects corrupt workbook bytes', async () => {
      const parsed = await parsePermanentExcel(new ArrayBuffer(8));
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error).toBe('invalid_file');
    });

    it('rejects workbook without permanent sheet headers', async () => {
      const parsed = await parsePermanentExcel(await buildInvalidExcelBuffer());
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error).toBe('missing_sheet');
    });

    it('imports valid rows and reports skipped invalid rows together', async () => {
      const buffer = await buildPermanentExcelBuffer([
        { categoryName: 'Support' },
        { displayName: 'Valid', shortcut: 'ok', content: 'Good', category: 'Support' },
        { displayName: 'No category', shortcut: 'x', content: 'Bad', category: '' },
        { displayName: 'Unknown cat', shortcut: 'y', content: 'Bad', category: 'Ghost' },
        { displayName: 'Bad trigger', shortcut: 'a b', content: 'Bad', category: 'Support' },
      ]);
      const parsed = await parsePermanentExcel(buffer);
      expect(parsed.success).toBe(true);
      if (!parsed.success) return;

      expect(parsed.data.shortcuts).toHaveLength(1);
      expect(parsed.skippedRows.map((row) => row.reason)).toEqual([
        'missing_category',
        'unknown_category',
        'invalid_shortcut',
      ]);
    });
  });

  describe('Excel temp imports', () => {
    it('rejects workbook with only invalid temp rows', async () => {
      const buffer = await buildTempExcelBuffer([
        { displayName: 'Broken', shortcut: '', content: 'Missing trigger' },
      ]);
      const parsed = await parseTempExcel(buffer);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error).toBe('no_valid_rows');
        expect(parsed.skippedRows?.[0]?.reason).toBe('missing_shortcut');
      }
    });

    it('accepts mixed valid and invalid temp rows when at least one row is valid', async () => {
      const buffer = await buildTempExcelBuffer([
        { displayName: 'Good', shortcut: 'ok', content: 'Works' },
        { displayName: 'Bad', shortcut: '', content: 'Fails' },
      ]);
      const parsed = await parseTempExcel(buffer);
      expect(parsed.success).toBe(true);
      if (!parsed.success) return;
      expect(parsed.data.shortcuts).toHaveLength(1);
      expect(parsed.skippedRows).toHaveLength(1);
    });
  });
});
