import { describe, expect, it } from 'vitest';
import {
  buildPermanentExport,
  buildTempExport,
  categoriesWithRandomColors,
  hasPermanentImportData,
  hasTempImportData,
  parsePermanentExport,
  parseTempExport,
} from '@/lib/export-import';
import {
  createPermanentExportPayload,
  createSampleAppData,
  createTempExportPayload,
} from '@/test/fixtures/app-data';
import { TEMP_CATEGORY_ID } from '@/shared/constants';

describe('export-import JSON', () => {
  const data = createSampleAppData();

  it('builds permanent export without temp category', () => {
    const exported = buildPermanentExport(data);
    expect(exported.type).toBe('permanent');
    expect(exported.categories.every((c) => c.id !== TEMP_CATEGORY_ID)).toBe(true);
    expect(exported.shortcuts.every((s) => s.kind === 'permanent')).toBe(true);
    expect(exported.shortcuts).toHaveLength(2);
  });

  it('builds temp export with only temp shortcuts', () => {
    const exported = buildTempExport(data);
    expect(exported.type).toBe('temp');
    expect(exported.shortcuts).toHaveLength(1);
    expect(exported.shortcuts[0]?.kind).toBe('temp');
  });

  it('round-trips valid permanent JSON export', () => {
    const exported = buildPermanentExport(data);
    const parsed = parsePermanentExport(exported);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.shortcuts).toEqual(exported.shortcuts);
    }
  });

  it('round-trips valid temp JSON export', () => {
    const exported = buildTempExport(data);
    const parsed = parseTempExport(exported);
    expect(parsed.success).toBe(true);
  });

  it('preserves textarea newlines through JSON export and import', () => {
    const multiline = createSampleAppData();
    multiline.shortcuts = multiline.shortcuts.map((shortcut) => ({
      ...shortcut,
      content: 'Line one\nLine two',
    }));

    const permanent = parsePermanentExport(buildPermanentExport(multiline));
    expect(permanent.success).toBe(true);
    if (permanent.success) {
      expect(permanent.data.shortcuts[0]?.content).toBe('Line one\nLine two');
    }

    const temp = parseTempExport(buildTempExport(multiline));
    expect(temp.success).toBe(true);
    if (temp.success) {
      expect(temp.data.shortcuts[0]?.content).toBe('Line one\nLine two');
    }
  });

  it('assigns random colors when importing export categories', () => {
    const colored = categoriesWithRandomColors([{ id: 'cat-1', name: 'Support' }]);
    expect(colored[0]?.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('detects existing importable data flags', () => {
    expect(hasPermanentImportData(data)).toBe(true);
    expect(hasTempImportData(data)).toBe(true);

    const empty = {
      ...data,
      categories: data.categories.filter((c) => c.id === TEMP_CATEGORY_ID),
      shortcuts: [],
    };
    expect(hasPermanentImportData(empty)).toBe(false);
    expect(hasTempImportData(empty)).toBe(false);
  });

  describe('invalid permanent import payloads', () => {
    it.each([
      ['null', null],
      ['empty object', {}],
      ['wrong version', { version: 2, type: 'permanent', categories: [], shortcuts: [] }],
      ['wrong type', { version: 1, type: 'temp', categories: [], shortcuts: [] }],
    ])('rejects %s', (_label, payload) => {
      expect(parsePermanentExport(payload).success).toBe(false);
    });

    it('rejects shortcuts with numbers', () => {
      const parsed = parsePermanentExport({
        ...createPermanentExportPayload(),
        shortcuts: [
          {
            ...createPermanentExportPayload().shortcuts[0]!,
            shortcut: 'bad123',
          },
        ],
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects malformed shortcut tokens', () => {
      const parsed = parsePermanentExport({
        ...createPermanentExportPayload(),
        shortcuts: [
          {
            ...createPermanentExportPayload().shortcuts[0]!,
            shortcut: 'invalid shortcut',
          },
        ],
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects empty required shortcut fields', () => {
      const parsed = parsePermanentExport({
        ...createPermanentExportPayload(),
        shortcuts: [
          {
            ...createPermanentExportPayload().shortcuts[0]!,
            content: '',
          },
        ],
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('invalid temp import payloads', () => {
    it('accepts temp export payload even when shortcut kind is permanent (import normalizes kind)', () => {
      const parsed = parseTempExport({
        ...createTempExportPayload(),
        shortcuts: createTempExportPayload().shortcuts.map((s) => ({
          ...s,
          kind: 'permanent' as const,
        })),
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects empty shortcut content', () => {
      const parsed = parseTempExport({
        ...createTempExportPayload(),
        shortcuts: createTempExportPayload().shortcuts.map((s) => ({
          ...s,
          content: '',
        })),
      });
      expect(parsed.success).toBe(false);
    });
  });
});
