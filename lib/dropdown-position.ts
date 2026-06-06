export const DROPDOWN_MIN_WIDTH = 320;
export const DROPDOWN_MAX_WIDTH = 420;
export const DROPDOWN_MAX_HEIGHT = 280;
export const DROPDOWN_GAP = 4;
export const VIEWPORT_PADDING = 8;

export type DropdownPlacement = 'bottom' | 'top';

function isRootMount(mount: HTMLElement): boolean {
  return mount === document.body || mount === document.documentElement;
}

function getMountScroll(mount: HTMLElement): { left: number; top: number } {
  if (isRootMount(mount)) {
    return { left: window.scrollX, top: window.scrollY };
  }
  return { left: mount.scrollLeft, top: mount.scrollTop };
}

interface ViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getViewportBounds(mount?: HTMLElement): ViewportBounds {
  const pad = VIEWPORT_PADDING;
  if (!mount || isRootMount(mount)) {
    return {
      left: pad,
      top: pad,
      right: window.innerWidth - pad,
      bottom: window.innerHeight - pad,
    };
  }

  const mountRect = mount.getBoundingClientRect();
  return {
    left: Math.max(mountRect.left, pad),
    top: Math.max(mountRect.top, pad),
    right: Math.min(mountRect.right, window.innerWidth - pad),
    bottom: Math.min(mountRect.bottom, window.innerHeight - pad),
  };
}

function resolveDropdownSize(width?: number, height?: number): {
  width: number;
  height: number;
} {
  return {
    width: clamp(width ?? DROPDOWN_MIN_WIDTH, DROPDOWN_MIN_WIDTH, DROPDOWN_MAX_WIDTH),
    height: Math.min(height ?? DROPDOWN_MAX_HEIGHT, DROPDOWN_MAX_HEIGHT),
  };
}

function computeVertical(
  rect: DOMRect,
  bounds: ViewportBounds,
  dropdownHeight: number,
): { top: number; placement: DropdownPlacement } {
  const gap = DROPDOWN_GAP;
  const spaceBelow = bounds.bottom - rect.bottom - gap;
  const spaceAbove = rect.top - bounds.top - gap;

  const preferBottom = spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove;
  const placement: DropdownPlacement = preferBottom ? 'bottom' : 'top';

  let top =
    placement === 'bottom'
      ? rect.bottom + gap
      : rect.top - dropdownHeight - gap;

  top = clamp(top, bounds.top, Math.max(bounds.top, bounds.bottom - dropdownHeight));
  return { top, placement };
}

function computeHorizontal(
  rect: DOMRect,
  bounds: ViewportBounds,
  dropdownWidth: number,
): number {
  let left = rect.left;

  if (left + dropdownWidth > bounds.right) {
    left = Math.max(bounds.left, rect.right - dropdownWidth);
  }
  if (left + dropdownWidth > bounds.right) {
    left = bounds.right - dropdownWidth;
  }
  if (left < bounds.left) {
    left = bounds.left;
  }

  return clamp(left, bounds.left, Math.max(bounds.left, bounds.right - dropdownWidth));
}

/**
 * Viewport-aware dropdown placement.
 * - No mount: viewport coords for `position: fixed` (extension UI portal).
 * - With mount: container-relative coords for `position: absolute` (content script).
 */
export function dropdownPosition(
  rect: DOMRect,
  mount?: HTMLElement,
  dropdownHeight?: number,
  dropdownWidth?: number,
): { left: number; top: number; placement: DropdownPlacement } {
  const bounds = getViewportBounds(mount);
  const { width, height } = resolveDropdownSize(dropdownWidth, dropdownHeight);

  const viewportLeft = computeHorizontal(rect, bounds, width);
  const { top: viewportTop, placement } = computeVertical(rect, bounds, height);

  if (!mount) {
    return { left: viewportLeft, top: viewportTop, placement };
  }

  const mountRect = mount.getBoundingClientRect();
  const { left: scrollLeft, top: scrollTop } = getMountScroll(mount);

  return {
    left: viewportLeft - mountRect.left + scrollLeft,
    top: viewportTop - mountRect.top + scrollTop,
    placement,
  };
}
