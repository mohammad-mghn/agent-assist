function isRootMount(mount: HTMLElement): boolean {
  return mount === document.body || mount === document.documentElement;
}

function getMountScroll(mount: HTMLElement): { left: number; top: number } {
  if (isRootMount(mount)) {
    return { left: window.scrollX, top: window.scrollY };
  }
  return { left: mount.scrollLeft, top: mount.scrollTop };
}

function getMountBounds(mount: HTMLElement): { width: number; height: number } {
  if (isRootMount(mount)) {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: mount.clientWidth, height: mount.clientHeight };
}

/**
 * - No mount: viewport coords for `position: fixed` (extension UI portal).
 * - With mount: container-relative coords for `position: absolute` (content script).
 */
export function dropdownPosition(
  rect: DOMRect,
  mount?: HTMLElement,
): { left: number; top: number } {
  if (!mount) {
    return {
      left: Math.min(Math.max(0, rect.left), window.innerWidth - 320),
      top: Math.min(Math.max(0, rect.bottom + 4), window.innerHeight - 8),
    };
  }

  const mountRect = mount.getBoundingClientRect();
  const { left: scrollLeft, top: scrollTop } = getMountScroll(mount);
  const { width, height } = getMountBounds(mount);

  return {
    left: Math.min(
      Math.max(0, rect.left - mountRect.left + scrollLeft),
      Math.max(0, width - 320),
    ),
    top: Math.min(
      Math.max(0, rect.bottom - mountRect.top + scrollTop + 4),
      Math.max(0, scrollTop + height - 8),
    ),
  };
}
