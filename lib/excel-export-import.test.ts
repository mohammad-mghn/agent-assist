import { describe, expect, it } from 'vitest';
import {
  buildPermanentExcel,
  buildPermanentExcelTemplate,
  buildPermanentJsonTemplate,
  buildTempExcel,
  buildTempExcelTemplate,
  buildTempJsonTemplate,
  parsePermanentExcel,
  parseTempExcel,
} from '@/lib/excel-export-import';
import { createSampleAppData } from '@/test/fixtures/app-data';
import {
  buildInvalidExcelBuffer,
  buildPermanentExcelBuffer,
  buildTempExcelBuffer,
} from '@/test/helpers/excel-builders';

describe('excel-export-import', () => {
  const data = createSampleAppData();

  it('builds JSON templates that match schema expectations', () => {
    expect(buildPermanentJsonTemplate().type).toBe('permanent');
    expect(buildTempJsonTemplate().type).toBe('temp');
  });

  it('round-trips permanent data through excel export and import', async () => {
    const buffer = await buildPermanentExcel(data);
    const parsed = await parsePermanentExcel(buffer);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shortcuts).toHaveLength(2);
      expect(parsed.data.categories.length).toBeGreaterThanOrEqual(2);
      expect(parsed.skippedRows).toEqual([]);
    }
  });

  it('round-trips temp data through excel export and import', async () => {
    const buffer = await buildTempExcel(data);
    const parsed = await parseTempExcel(buffer);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shortcuts).toHaveLength(1);
      expect(parsed.data.shortcuts[0]?.shortcut).toBe('note');
    }
  });

  it('preserves textarea newlines through excel export and import', async () => {
    const multiline = createSampleAppData();
    multiline.shortcuts = multiline.shortcuts.map((shortcut) =>
      shortcut.kind === 'temp'
        ? {
            ...shortcut,
            content: 'First line\nSecond line\nThird line',
          }
        : {
            ...shortcut,
            content: 'Hello,\n\nThank you for your message.',
          },
    );

    const permanentBuffer = await buildPermanentExcel(multiline);
    const permanentParsed = await parsePermanentExcel(permanentBuffer);
    expect(permanentParsed.success).toBe(true);
    if (permanentParsed.success) {
      expect(permanentParsed.data.shortcuts[0]?.content).toBe(
        'Hello,\n\nThank you for your message.',
      );
    }

    const tempBuffer = await buildTempExcel(multiline);
    const tempParsed = await parseTempExcel(tempBuffer);
    expect(tempParsed.success).toBe(true);
    if (tempParsed.success) {
      expect(tempParsed.data.shortcuts[0]?.content).toBe(
        'First line\nSecond line\nThird line',
      );
    }
  });

  it('parses official excel templates', async () => {
    const permanent = await parsePermanentExcel(await buildPermanentExcelTemplate());
    const temp = await parseTempExcel(await buildTempExcelTemplate());
    expect(permanent.success).toBe(true);
    expect(temp.success).toBe(true);
  });

  it('rejects workbooks without expected sheets', async () => {
    const permanent = await parsePermanentExcel(await buildInvalidExcelBuffer());
    const temp = await parseTempExcel(await buildInvalidExcelBuffer());
    expect(permanent.success).toBe(false);
    if (!permanent.success) expect(permanent.error).toBe('missing_sheet');
    expect(temp.success).toBe(false);
    if (!temp.success) expect(temp.error).toBe('missing_sheet');
  });

  it('sanitizes numeric characters from excel shortcut cells', async () => {
    const buffer = await buildTempExcelBuffer([
      { displayName: 'Numeric shortcut', shortcut: 'note2', content: 'Body' },
    ]);
    const parsed = await parseTempExcel(buffer);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shortcuts[0]?.shortcut).toBe('note');
    }
  });

  it('allows duplicate shortcut cells after sanitization to be resolved on import', async () => {
    const buffer = await buildTempExcelBuffer([
      { displayName: 'First', shortcut: 'note', content: 'Body one' },
      { displayName: 'Second', shortcut: 'note2', content: 'Body two' },
    ]);
    const parsed = await parseTempExcel(buffer);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shortcuts.map((s) => s.shortcut)).toEqual(['note', 'note']);
    }
  });

  describe('skipped invalid permanent rows', () => {
    it('skips rows with unknown category', async () => {
      const buffer = await buildPermanentExcelBuffer([
        { categoryName: 'Support' },
        {
          displayName: 'Bad row',
          shortcut: 'bad',
          content: 'Text',
          category: 'Missing category',
        },
        {
          displayName: 'Good row',
          shortcut: 'good',
          content: 'Valid text',
          category: 'Support',
        },
      ]);
      const parsed = await parsePermanentExcel(buffer);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.shortcuts).toHaveLength(1);
        expect(parsed.skippedRows).toContainEqual({
          row: 3,
          reason: 'unknown_category',
        });
      }
    });

    it.each([
      ['missing_category', { displayName: 'X', shortcut: 'x', content: 'Y', category: '' }],
      ['missing_shortcut', { displayName: 'X', shortcut: '', content: 'Y', category: 'Support' }],
      ['missing_content', { displayName: 'X', shortcut: 'x', content: '', category: 'Support' }],
      ['invalid_shortcut', { displayName: 'X', shortcut: 'bad token', content: 'Y', category: 'Support' }],
    ] as const)('skips permanent row with %s', async (reason, row) => {
      const buffer = await buildPermanentExcelBuffer([
        { categoryName: 'Support' },
        row,
      ]);
      const parsed = await parsePermanentExcel(buffer);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.shortcuts).toHaveLength(0);
        expect(parsed.skippedRows[0]?.reason).toBe(reason);
      }
    });

    it('returns no_valid_rows when categories and shortcuts are all invalid', async () => {
      const buffer = await buildPermanentExcelBuffer([
        { categoryName: '' },
        {
          displayName: 'Broken',
          shortcut: '',
          content: 'No trigger',
          category: 'Support',
        },
      ]);
      const parsed = await parsePermanentExcel(buffer);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error).toBe('no_valid_rows');
        expect(parsed.skippedRows?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('skipped invalid temp rows', () => {
    it.each([
      ['missing_shortcut', { displayName: 'X', shortcut: '', content: 'Body' }],
      ['missing_content', { displayName: 'X', shortcut: 'x', content: '' }],
      ['invalid_shortcut', { displayName: 'X', shortcut: 'bad token', content: 'Body' }],
    ] as const)('skips temp row with %s', async (reason, row) => {
      const buffer = await buildTempExcelBuffer([row]);
      const parsed = await parseTempExcel(buffer);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error).toBe('no_valid_rows');
        expect(parsed.skippedRows?.[0]?.reason).toBe(reason);
      }
    });
  });
});
