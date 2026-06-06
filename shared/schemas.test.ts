import { describe, expect, it } from 'vitest';
import {
  categoryFormSchema,
  createShortcutFormSchema,
  exportCategorySchema,
  permanentExportSchema,
  sanitizeShortcutToken,
  shortcutFormSchema,
  shortcutSchema,
  tempExportSchema,
} from '@/shared/schemas';

describe('sanitizeShortcutToken', () => {
  it('strips digits from shortcut tokens', () => {
    expect(sanitizeShortcutToken('reply2')).toBe('reply');
    expect(sanitizeShortcutToken('v2beta')).toBe('vbeta');
  });

  it('preserves unicode letters and separators', () => {
    expect(sanitizeShortcutToken('سلام')).toBe('سلام');
    expect(sanitizeShortcutToken('my-shortcut')).toBe('my-shortcut');
  });
});

describe('shortcutFormSchema', () => {
  const valid = {
    name: 'Reply',
    categoryId: 'cat-1',
    content: 'Hello',
    shortcut: 'reply',
    kind: 'permanent' as const,
  };

  it('accepts valid permanent shortcut form values', () => {
    expect(shortcutFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty required fields', () => {
    expect(shortcutFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(shortcutFormSchema.safeParse({ ...valid, content: '' }).success).toBe(false);
    expect(shortcutFormSchema.safeParse({ ...valid, shortcut: '' }).success).toBe(false);
    expect(shortcutFormSchema.safeParse({ ...valid, categoryId: '' }).success).toBe(false);
  });

  it('rejects shortcuts with numbers or invalid characters', () => {
    expect(shortcutFormSchema.safeParse({ ...valid, shortcut: 'reply2' }).success).toBe(false);
    expect(shortcutFormSchema.safeParse({ ...valid, shortcut: 'bad shortcut' }).success).toBe(
      false,
    );
    expect(shortcutFormSchema.safeParse({ ...valid, shortcut: 'foo@bar' }).success).toBe(false);
  });

  it('accepts unicode shortcut tokens', () => {
    expect(
      shortcutFormSchema.safeParse({ ...valid, shortcut: 'پاسخ', kind: 'permanent' }).success,
    ).toBe(true);
  });

  it('uses localized validation messages when provided', () => {
    const schema = createShortcutFormSchema({
      'validation.nameRequired': 'Custom name required',
    });
    const result = schema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Custom name required');
    }
  });
});

describe('categoryFormSchema', () => {
  it('rejects empty or overlong category names', () => {
    expect(categoryFormSchema.safeParse({ name: '', color: '#3b82f6' }).success).toBe(false);
    expect(
      categoryFormSchema.safeParse({ name: 'x'.repeat(51), color: '#3b82f6' }).success,
    ).toBe(false);
  });

  it('rejects invalid category colors', () => {
    expect(
      categoryFormSchema.safeParse({ name: 'Support', color: 'not-a-color' }).success,
    ).toBe(false);
  });
});

describe('import export schemas', () => {
  const permanentShortcut = {
    id: 'sc-1',
    name: 'Reply',
    shortcut: 'reply',
    content: 'Thanks',
    categoryId: 'cat-1',
    kind: 'permanent' as const,
  };

  it('validates permanent export payloads', () => {
    const payload = {
      version: 1,
      type: 'permanent',
      categories: [{ id: 'cat-1', name: 'Support' }],
      shortcuts: [permanentShortcut],
    };
    expect(permanentExportSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects permanent export with wrong type or version', () => {
    expect(
      permanentExportSchema.safeParse({
        version: 2,
        type: 'permanent',
        categories: [],
        shortcuts: [],
      }).success,
    ).toBe(false);
    expect(
      permanentExportSchema.safeParse({
        version: 1,
        type: 'temp',
        categories: [],
        shortcuts: [],
      }).success,
    ).toBe(false);
  });

  it('rejects shortcuts referencing missing categories in strict shortcut schema', () => {
    expect(
      shortcutSchema.safeParse({
        ...permanentShortcut,
        categoryId: '',
      }).success,
    ).toBe(false);
  });

  it('allows export categories without color', () => {
    expect(exportCategorySchema.safeParse({ id: 'cat-1', name: 'Support' }).success).toBe(true);
  });

  it('validates temp export payloads', () => {
    const payload = {
      version: 1,
      type: 'temp',
      shortcuts: [
        {
          ...permanentShortcut,
          id: 'sc-temp',
          shortcut: 'note',
          kind: 'temp',
          categoryId: 'temp-category',
        },
      ],
    };
    expect(tempExportSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts shortcut shape in temp export (kind normalized on import)', () => {
    expect(
      tempExportSchema.safeParse({
        version: 1,
        type: 'temp',
        shortcuts: [permanentShortcut],
      }).success,
    ).toBe(true);
  });
});
