import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  DROPDOWN_GAP,
  DROPDOWN_MAX_HEIGHT,
  DROPDOWN_MIN_WIDTH,
  dropdownPosition,
} from '@/lib/dropdown-position';

function mockViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

describe('dropdownPosition', () => {
  beforeEach(() => {
    mockViewport(800, 600);
  });

  afterEach(() => {
    mockViewport(800, 600);
  });

  it('places dropdown below the trigger when there is room', () => {
    const rect = new DOMRect(100, 100, 0, 16);
    const { left, top, placement } = dropdownPosition(rect, undefined, 200, 320);

    expect(placement).toBe('bottom');
    expect(top).toBe(rect.bottom + DROPDOWN_GAP);
    expect(left).toBe(100);
  });

  it('flips above the trigger when near the bottom of the viewport', () => {
    const rect = new DOMRect(100, 560, 0, 16);
    const { top, placement } = dropdownPosition(rect, undefined, 200, 320);

    expect(placement).toBe('top');
    expect(top).toBe(rect.top - 200 - DROPDOWN_GAP);
  });

  it('shifts left when the dropdown would overflow the right edge', () => {
    const rect = new DOMRect(600, 100, 0, 16);
    const width = DROPDOWN_MIN_WIDTH;
    const { left } = dropdownPosition(rect, undefined, 200, width);

    expect(left + width).toBeLessThanOrEqual(800 - 8);
  });

  it('aligns to the trigger right edge when that fits better horizontally', () => {
    const rect = new DOMRect(520, 100, 120, 16);
    const width = DROPDOWN_MIN_WIDTH;
    const { left } = dropdownPosition(rect, undefined, 200, width);

    expect(left).toBe(rect.right - width);
  });

  it('clamps vertical position when neither side fully fits', () => {
    const rect = new DOMRect(100, 300, 0, 16);
    const height = DROPDOWN_MAX_HEIGHT;
    const { top } = dropdownPosition(rect, undefined, height, 320);

    expect(top).toBeGreaterThanOrEqual(8);
    expect(top + height).toBeLessThanOrEqual(600 - 8);
  });

  it('converts to mount-relative coordinates for content-script dropdowns', () => {
    const mount = document.createElement('div');
    mount.style.position = 'absolute';
    mount.style.left = '50px';
    mount.style.top = '40px';
    mount.style.width = '700px';
    mount.style.height = '500px';
    document.body.appendChild(mount);

    mount.getBoundingClientRect = () =>
      new DOMRect(50, 40, 700, 500);

    const rect = new DOMRect(120, 180, 0, 16);
    const { left, top } = dropdownPosition(rect, mount, 200, 320);

    expect(left).toBe(120 - 50);
    expect(top).toBe(180 + 16 + DROPDOWN_GAP - 40);

    mount.remove();
  });
});
