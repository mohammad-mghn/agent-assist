import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { AppData, ShortcutKind } from '@/shared/types';

export function getDefaultCategoryId(data: AppData, kind: ShortcutKind): string {
  if (kind === 'temp') return TEMP_CATEGORY_ID;
  return data.categories.find((c) => c.id !== TEMP_CATEGORY_ID)?.id ?? '';
}
