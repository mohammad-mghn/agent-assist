/**
 * Native `<dialog>` and open popovers render in the browser top layer, above
 * any z-index on `document.body`. Mount the dropdown inside those containers
 * so it stays visible. Avoid generic modal wrappers — transforms on those
 * elements break `position: fixed` coordinates.
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

  return document.body;
}
