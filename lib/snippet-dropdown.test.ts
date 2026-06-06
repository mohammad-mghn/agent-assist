import { describe, expect, it, vi } from 'vitest';
import { createSampleAppData } from '@/test/fixtures/app-data';
import {
  handleSnippetDropdownKeydown,
  isSnippetDropdownEvent,
  shouldKeepSnippetDropdownOpen,
} from '@/lib/snippet-dropdown';
import { filterShortcuts } from '@/lib/shortcut-index';

describe('isSnippetDropdownEvent', () => {
  it('detects clicks inside the snippet dropdown', () => {
    const dropdown = document.createElement('div');
    dropdown.setAttribute('data-snippet-assist', 'dropdown');
    expect(isSnippetDropdownEvent([dropdown])).toBe(true);
    expect(isSnippetDropdownEvent([document.body])).toBe(false);
  });
});

describe('shouldKeepSnippetDropdownOpen', () => {
  const data = createSampleAppData();

  it('keeps dropdown open when there are matching items', () => {
    const items = filterShortcuts(data, '/', 're');
    expect(shouldKeepSnippetDropdownOpen(data, '/', 're', items)).toBe(true);
  });

  it('keeps dropdown open for empty query after trigger', () => {
    expect(shouldKeepSnippetDropdownOpen(data, '/', '', [])).toBe(true);
  });

  it('keeps dropdown open when query matches an exact shortcut with no prefix matches', () => {
    const items = filterShortcuts(data, '/', 'reply');
    expect(shouldKeepSnippetDropdownOpen(data, '/', 'reply', items)).toBe(true);
  });

  it('closes dropdown when query has no matches and no exact shortcut', () => {
    expect(shouldKeepSnippetDropdownOpen(data, '/', 'zzzz', [])).toBe(false);
  });
});

describe('handleSnippetDropdownKeydown', () => {
  function createHandlers(overrides: Partial<Parameters<typeof handleSnippetDropdownKeydown>[1]> = {}) {
    return {
      open: false,
      itemCount: 3,
      close: vi.fn(),
      onArrowDown: vi.fn(),
      onArrowUp: vi.fn(),
      pickIndex: vi.fn(),
      pickActive: vi.fn(),
      tryExactInsert: vi.fn(() => false),
      tryJumpStopAdvance: vi.fn(() => false),
      onTriggerTyped: vi.fn(),
      ...overrides,
    };
  }

  it('notifies when trigger characters are typed', () => {
    const handlers = createHandlers();
    handleSnippetDropdownKeydown(new KeyboardEvent('keydown', { key: '/' }), handlers);
    expect(handlers.onTriggerTyped).toHaveBeenCalled();
  });

  it('closes menu on Escape when open', () => {
    const handlers = createHandlers({ open: true });
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(event.defaultPrevented).toBe(true);
    expect(handlers.close).toHaveBeenCalled();
  });

  it('navigates with arrow keys when open', () => {
    const handlers = createHandlers({ open: true });
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    handleSnippetDropdownKeydown(down, handlers);
    expect(down.defaultPrevented).toBe(true);
    expect(handlers.onArrowDown).toHaveBeenCalled();

    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    handleSnippetDropdownKeydown(up, handlers);
    expect(up.defaultPrevented).toBe(true);
    expect(handlers.onArrowUp).toHaveBeenCalled();
  });

  it('picks item by number key 1-9 when open', () => {
    const handlers = createHandlers({ open: true, itemCount: 5 });
    const event = new KeyboardEvent('keydown', { key: '2', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(event.defaultPrevented).toBe(true);
    expect(handlers.pickIndex).toHaveBeenCalledWith(1);
  });

  it('ignores number keys beyond item count', () => {
    const handlers = createHandlers({ open: true, itemCount: 2 });
    const event = new KeyboardEvent('keydown', { key: '9', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(event.defaultPrevented).toBe(false);
    expect(handlers.pickIndex).not.toHaveBeenCalled();
  });

  it('picks active item on Enter when menu has items', () => {
    const handlers = createHandlers({ open: true, itemCount: 2 });
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(event.defaultPrevented).toBe(true);
    expect(handlers.pickActive).toHaveBeenCalled();
  });

  it('tries exact insert on Enter when menu is closed', () => {
    const tryExactInsert = vi.fn(() => true);
    const handlers = createHandlers({ open: false, tryExactInsert });
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(tryExactInsert).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('advances jump-stop on Tab when menu is closed', () => {
    const tryJumpStopAdvance = vi.fn(() => true);
    const handlers = createHandlers({ open: false, tryJumpStopAdvance });
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    handleSnippetDropdownKeydown(event, handlers);
    expect(tryJumpStopAdvance).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});
