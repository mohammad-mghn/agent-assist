import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('@/hooks/use-ui-locale', () => ({
  useUiLocale: () => ({
    locale: 'en-US' as const,
    setUiLocale: vi.fn(),
    t: (key: string, params?: Record<string, string>) => {
      if (params?.count) return `${key}:${params.count}`;
      return key;
    },
    dir: 'ltr' as const,
  }),
}));

const storageListeners = new Set<
  (changes: Record<string, { newValue?: unknown }>, area: string) => void
>();

Object.defineProperty(globalThis, 'browser', {
  value: {
    storage: {
      local: {
        get: vi.fn(async () => ({})),
        set: vi.fn(async () => undefined),
      },
      onChanged: {
        addListener: vi.fn((listener: (typeof storageListeners extends Set<infer T> ? T : never)) => {
          storageListeners.add(listener);
        }),
        removeListener: vi.fn((listener: (typeof storageListeners extends Set<infer T> ? T : never)) => {
          storageListeners.delete(listener);
        }),
      },
    },
  },
  configurable: true,
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

if (!globalThis.crypto?.randomUUID) {
  let counter = 0;
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`,
    },
  });
}
