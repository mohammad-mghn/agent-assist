import {
  APP_VERSION,
  DEFAULT_CATEGORY_COLOR,
  TEMP_CATEGORY_ID,
  TEMP_CATEGORY_NAME,
} from '../shared/constants';
import type { AppData } from '../shared/types';

export function createDefaultAppData(): AppData {
  return {
    version: APP_VERSION,
    enabled: true,
    dropdownEnabled: true,
    savedDropdownEnabled: true,
    categories: [
      {
        id: TEMP_CATEGORY_ID,
        name: TEMP_CATEGORY_NAME,
        color: DEFAULT_CATEGORY_COLOR,
      },
    ],
    shortcuts: [],
  };
}
