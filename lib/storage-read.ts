import { STORAGE_KEY_LOCAL } from '../shared/constants';
import type { AppData } from '../shared/types';
import { createDefaultAppData } from './default-data';

export async function readAppDataCached(): Promise<AppData> {
  const localResult = await browser.storage.local.get(STORAGE_KEY_LOCAL);
  const raw = localResult[STORAGE_KEY_LOCAL] as AppData | undefined;
  if (raw?.version === 1 && Array.isArray(raw.shortcuts)) {
    return {
      ...raw,
      dropdownEnabled: raw.dropdownEnabled ?? true,
      savedDropdownEnabled:
        raw.savedDropdownEnabled ?? raw.dropdownEnabled ?? true,
    };
  }
  return createDefaultAppData();
}
