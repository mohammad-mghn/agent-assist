function createsFixedContainingBlock(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (style.transform !== 'none') return true;
  if (style.filter !== 'none') return true;
  if (style.perspective !== 'none') return true;
  if (style.backdropFilter !== 'none') return true;
  if (style.willChange.split(',').some((v) => v.trim().startsWith('transform'))) {
    return true;
  }
  return style.contain.split(' ').includes('paint');
}

/**
 * Mount the dropdown inside top-layer or transformed ancestors so it stays
 * visible and its coordinates share the same positioning context as the
 * trigger field.
 */
export function findDropdownMountPoint(el: HTMLElement): HTMLElement {
  const dialog = el.closest('dialog');
  if (dialog instanceof HTMLDialogElement && dialog.open) {
    return dialog;
  }

  let node: Element | null = el;
  while (node instanceof HTMLElement) {
    if (typeof node.matches === 'function' && node.matches(':popover-open')) {
      return node;
    }
    node = node.parentElement;
  }

  node = el.parentElement;
  while (node instanceof HTMLElement) {
    if (createsFixedContainingBlock(node)) {
      return node;
    }
    node = node.parentElement;
  }

  return document.body;
}
