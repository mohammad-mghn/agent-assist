import { z } from 'zod';
import { CATEGORY_COLORS, SHORTCUT_KINDS } from './constants';
import type { TranslationKey } from '@/lib/i18n/translations';

const categoryColorSchema = z.enum(
  CATEGORY_COLORS as unknown as [string, ...string[]],
);

const UNICODE_SHORTCUT_RE = /^[\p{L}\p{M}_-]+$/u;
const UNICODE_SHORTCUT_NUMBER_RE = /\p{N}/u;

export function sanitizeShortcutToken(value: string): string {
  return value.replace(/\p{N}/gu, '');
}

type ValidationMessages = Partial<Record<TranslationKey, string>>;

function msg(messages: ValidationMessages, key: TranslationKey, fallback: string) {
  return messages[key] ?? fallback;
}

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Category name is required').max(50),
  color: categoryColorSchema,
});

export const exportCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Category name is required').max(50),
  color: categoryColorSchema.optional(),
});

export function createShortcutSchema(messages: ValidationMessages = {}) {
  return z.object({
    id: z.string().min(1),
    name: z
      .string()
      .min(1, msg(messages, 'validation.nameRequired', 'Name is required'))
      .max(80),
    shortcut: z
      .string()
      .min(
        1,
        msg(messages, 'validation.shortcutRequired', 'Shortcut is required'),
      )
      .max(40)
      .regex(
        UNICODE_SHORTCUT_RE,
        msg(
          messages,
          'validation.shortcutFormat',
          'Use letters only (any language), underscores, or hyphens — no numbers',
        ),
      )
      .refine(
        (value) => !UNICODE_SHORTCUT_NUMBER_RE.test(value),
        msg(
          messages,
          'validation.shortcutFormat',
          'Use letters only (any language), underscores, or hyphens — no numbers',
        ),
      ),
    content: z
      .string()
      .min(
        1,
        msg(messages, 'validation.contentRequired', 'Content is required'),
      ),
    categoryId: z
      .string()
      .min(
        1,
        msg(messages, 'validation.categoryRequired', 'Category is required'),
      ),
    kind: z.enum(SHORTCUT_KINDS),
  });
}

export const shortcutSchema = createShortcutSchema();

export const appDataSchema = z.object({
  version: z.literal(1),
  enabled: z.boolean(),
  dropdownEnabled: z.boolean().default(true),
  savedDropdownEnabled: z.boolean().default(true),
  categories: z.array(categorySchema),
  shortcuts: z.array(shortcutSchema),
});

export function createShortcutFormSchema(messages: ValidationMessages = {}) {
  return z.object({
    name: z
      .string()
      .min(1, msg(messages, 'validation.nameRequired', 'Name is required'))
      .max(80),
    categoryId: z
      .string()
      .min(
        1,
        msg(messages, 'validation.categoryRequired', 'Select a category'),
      ),
    content: z
      .string()
      .min(
        1,
        msg(messages, 'validation.contentRequired', 'Content is required'),
      ),
    shortcut: z
      .string()
      .min(
        1,
        msg(messages, 'validation.shortcutRequired', 'Shortcut is required'),
      )
      .max(40)
      .regex(
        UNICODE_SHORTCUT_RE,
        msg(
          messages,
          'validation.shortcutFormat',
          'Use letters only (any language), underscores, or hyphens — no numbers',
        ),
      )
      .refine(
        (value) => !UNICODE_SHORTCUT_NUMBER_RE.test(value),
        msg(
          messages,
          'validation.shortcutFormat',
          'Use letters only (any language), underscores, or hyphens — no numbers',
        ),
      ),
    kind: z.enum(SHORTCUT_KINDS),
  });
}

export const shortcutFormSchema = createShortcutFormSchema();

export type ShortcutFormValues = z.infer<typeof shortcutFormSchema>;

export function createCategoryFormSchema(messages: ValidationMessages = {}) {
  return z.object({
    name: z
      .string()
      .min(
        1,
        msg(
          messages,
          'validation.categoryNameRequired',
          'Category name is required',
        ),
      )
      .max(50),
    color: categoryColorSchema,
  });
}

export const categoryFormSchema = createCategoryFormSchema();

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const permanentExportSchema = z.object({
  version: z.literal(1),
  type: z.literal('permanent'),
  categories: z.array(exportCategorySchema),
  shortcuts: z.array(shortcutSchema),
});

export const tempExportSchema = z.object({
  version: z.literal(1),
  type: z.literal('temp'),
  shortcuts: z.array(shortcutSchema),
});
