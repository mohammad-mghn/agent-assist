import type { ShortcutKind } from '@/shared/types';

export type ImportDialogState = {
  open: boolean;
  type: ShortcutKind;
  payload: unknown;
} | null;
