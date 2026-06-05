function isInsideSnippetAssistUi(el: Element): boolean {
  return !!el.closest('[data-snippet-assist]:not([data-snippet-assist="dropdown"])');
}

function isDirectlyEligible(el: Element | null): el is HTMLElement {
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

export function getContentEditableHost(el: HTMLElement): HTMLElement {
  if (!el.isContentEditable) return el;
  let host = el;
  let parent = el.parentElement;
  while (parent?.isContentEditable && parent.getAttribute('contenteditable') !== 'false') {
    host = parent;
    parent = parent.parentElement;
  }
  return host;
}

function normalizeEligibleElement(el: HTMLElement): HTMLElement {
  if (el instanceof HTMLTextAreaElement) return el;
  return getContentEditableHost(el);
}

function elementFromNode(node: EventTarget | Node | null): Element | null {
  if (!node) return null;
  if (node instanceof Element) return node;
  if (node instanceof Text) return node.parentElement;
  return null;
}

export function findEligibleAncestor(from: Element | null): HTMLElement | null {
  let current: Element | null = from;
  while (current) {
    if (current instanceof HTMLElement && isDirectlyEligible(current)) {
      return normalizeEligibleElement(current);
    }
    current = current.parentElement;
  }
  return null;
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
  return isDirectlyEligible(el);
}

export function resolveEligibleElement(
  target: EventTarget | null,
  composedPath: EventTarget[] = [],
): HTMLElement | null {
  const fromTarget = findEligibleAncestor(elementFromNode(target as Node | null));
  if (fromTarget) return fromTarget;

  for (const node of composedPath) {
    const found = findEligibleAncestor(elementFromNode(node as Node | null));
    if (found) return found;
  }

  const deepActive = getDeepActiveElement();
  return findEligibleAncestor(deepActive);
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
