import { describe, expect, it } from 'vitest';
import { importPermanent, importTemp } from '@/lib/app-mutations';
import {
  buildPermanentExport,
  buildTempExport,
  categoriesWithRandomColors,
  parsePermanentExport,
  parseTempExport,
} from '@/lib/export-import';
import {
  buildPermanentExcel,
  buildTempExcel,
  parsePermanentExcel,
  parseTempExcel,
} from '@/lib/excel-export-import';
import { createDefaultAppData } from '@/lib/default-data';
import { createSampleAppData } from '@/test/fixtures/app-data';

type ImportFormat = 'json' | 'excel';
type ImportMode = 'merge' | 'overwrite';
type Dataset = 'permanent' | 'temp';

async function exportAndParse(
  data: ReturnType<typeof createSampleAppData>,
  dataset: Dataset,
  format: ImportFormat,
) {
  if (dataset === 'permanent') {
    if (format === 'json') {
      const payload = buildPermanentExport(data);
      return parsePermanentExport(payload);
    }
    const buffer = await buildPermanentExcel(data);
    return parsePermanentExcel(buffer);
  }

  if (format === 'json') {
    const payload = buildTempExport(data);
    return parseTempExport(payload);
  }
  const buffer = await buildTempExcel(data);
  return parseTempExcel(buffer);
}

describe('export → import pipeline (format × mode matrix)', () => {
  const source = createSampleAppData();

  const matrix: Array<[Dataset, ImportFormat, ImportMode]> = [
    ['permanent', 'json', 'merge'],
    ['permanent', 'json', 'overwrite'],
    ['permanent', 'excel', 'merge'],
    ['permanent', 'excel', 'overwrite'],
    ['temp', 'json', 'merge'],
    ['temp', 'json', 'overwrite'],
    ['temp', 'excel', 'merge'],
    ['temp', 'excel', 'overwrite'],
  ];

  it.each(matrix)(
    '%s %s import with %s preserves expected shortcut counts',
    async (dataset, format, mode) => {
      const target = createDefaultAppData();
      const parsed = await exportAndParse(source, dataset, format);
      expect(parsed.success).toBe(true);
      if (!parsed.success) return;

      const overwrite = mode === 'overwrite';
      const next =
        dataset === 'permanent'
          ? importPermanent(
              target,
              categoriesWithRandomColors(parsed.data.categories),
              parsed.data.shortcuts,
              overwrite,
            )
          : importTemp(target, parsed.data.shortcuts, overwrite);

      if (dataset === 'permanent') {
        expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(2);
        expect(next.categories.filter((c) => c.id !== 'temp-category')).toHaveLength(2);
      } else {
        expect(next.shortcuts.filter((s) => s.kind === 'temp')).toHaveLength(1);
        expect(next.shortcuts[0]?.shortcut).toBe('note');
      }
    },
  );

  it('merge keeps existing permanent shortcuts when importing temp data', async () => {
    const target = createSampleAppData();
    const parsed = await exportAndParse(source, 'temp', 'json');
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const next = importTemp(target, parsed.data.shortcuts, false);
    expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(2);
    expect(next.shortcuts.filter((s) => s.kind === 'temp')).toHaveLength(2);
  });

  it('overwrite replaces only the matching dataset slice', async () => {
    const target = createSampleAppData();
    const parsed = await exportAndParse(source, 'permanent', 'excel');
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const next = importPermanent(
      target,
      categoriesWithRandomColors(parsed.data.categories),
      parsed.data.shortcuts,
      true,
    );
    expect(next.shortcuts.filter((s) => s.kind === 'permanent')).toHaveLength(2);
    expect(next.shortcuts.filter((s) => s.kind === 'temp')).toHaveLength(1);
  });
});
