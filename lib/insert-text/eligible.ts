function isInsideSnippetAssistUi(el: Element): boolean {
  return !!el.closest('[data-snippet-assist]:not([data-snippet-assist="dropdown"])');
}

export function getDeepActiveElement(
  root: Document | ShadowRoot = document,
): Element | null {
  let active = root.activeElement;
  while (active instanceof HTMLElement && active.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

export function isEligibleElement(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (isInsideSnippetAssistUi(el)) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
    return false;
  }
  if (el instanceof HTMLTextAreaElement) {
    return true;
  }
  if (el.isContentEditable) {
    const ce = el.getAttribute('contenteditable');
    if (ce === 'false') return false;
    return true;
  }
  return false;
}

export function resolveEligibleElement(
  target: EventTarget | null,
  composedPath: EventTarget[] = [],
): HTMLElement | null {
  if (isEligibleElement(target as Element | null)) {
    return target as HTMLElement;
  }

  for (const node of composedPath) {
    if (isEligibleElement(node as Element | null)) {
      return node as HTMLElement;
    }
  }

  const deepActive = getDeepActiveElement();
  return isEligibleElement(deepActive) ? deepActive : null;
}

export function isMultilineElement(el: HTMLElement): boolean {
  if (el instanceof HTMLTextAreaElement) return true;
  if (!el.isContentEditable) return false;
  const style = getComputedStyle(el);
  if (style.whiteSpace.startsWith('pre')) return true;
  return el.scrollHeight > parseFloat(style.lineHeight || '20') * 1.8;
}

export function normalizeContent(content: string, multiline: boolean): string {
  if (multiline) return content;
  return content.replace(/\r?\n/g, ' ');
}
