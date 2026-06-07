function isInsideSnippetAssistUi(el: Element): boolean {
  return !!el.closest('[data-snippet-assist]:not([data-snippet-assist="dropdown"])');
}

const RICH_TEXT_EDITOR_SELECTORS = [
  'body[contenteditable="true"]',
  '[contenteditable="true"]',
  '.cke_editable',
  '.ql-editor',
  '.tox-edit-area',
  '.ProseMirror',
  '.fr-element',
  '.redactor-editor',
].join(', ');

function asElement(node: EventTarget | Node | null): Element | null {
  if (!node || typeof node !== 'object') return null;
  const n = node as Node;
  if (n.nodeType === Node.ELEMENT_NODE) return n as Element;
  if (n.nodeType === Node.TEXT_NODE) return (n as Text).parentElement;
  return null;
}

function isCrossRealmHtmlElement(el: Element | null): el is HTMLElement {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const view = el.ownerDocument?.defaultView;
  if (!view) return false;
  try {
    return el instanceof view.HTMLElement;
  } catch {
    return false;
  }
}

function isTextAreaElement(el: HTMLElement): el is HTMLTextAreaElement {
  return el.tagName === 'TEXTAREA';
}

function isIframeElement(el: Element): el is HTMLIFrameElement {
  return el.tagName === 'IFRAME';
}

function isRichTextEditable(el: HTMLElement): boolean {
  const ce = el.getAttribute('contenteditable');
  if (ce === 'false') return false;
  if (ce === 'true' || ce === '') return true;
  return el.isContentEditable;
}

function isEditableDocumentBody(el: HTMLElement): boolean {
  if (el.tagName !== 'BODY') return false;
  const doc = el.ownerDocument;
  if (doc.designMode === 'on') return true;
  return isRichTextEditable(el);
}

function isDirectlyEligible(el: Element | null): el is HTMLElement {
  if (!isCrossRealmHtmlElement(el)) return false;
  if (isInsideSnippetAssistUi(el)) return false;
  if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return false;
  if (isTextAreaElement(el)) return true;
  if (isEditableDocumentBody(el)) return true;
  return isRichTextEditable(el);
}

export function findEditableInFrame(
  frame: HTMLIFrameElement,
): HTMLElement | null {
  try {
    const doc = frame.contentDocument;
    if (!doc) return null;

    const fromActive = findEligibleAncestor(getDeepActiveElement(doc));
    if (fromActive) return fromActive;

    const body = doc.body;
    if (body && isDirectlyEligible(body)) {
      return normalizeEligibleElement(body);
    }

    const editor = doc.querySelector(RICH_TEXT_EDITOR_SELECTORS);
    if (editor && isDirectlyEligible(editor)) {
      return normalizeEligibleElement(editor);
    }

    if (doc.designMode === 'on' && body) return body;
  } catch {
    // Cross-origin iframe.
  }
  return null;
}

export function getContentEditableHost(el: HTMLElement): HTMLElement {
  if (!isRichTextEditable(el) && !el.isContentEditable) return el;
  let host = el;
  let parent = el.parentElement;
  while (parent && isCrossRealmHtmlElement(parent)) {
    if (!isRichTextEditable(parent) && !parent.isContentEditable) break;
    host = parent;
    parent = parent.parentElement;
  }
  return host;
}

function normalizeEligibleElement(el: HTMLElement): HTMLElement {
  if (isTextAreaElement(el)) return el;
  return getContentEditableHost(el);
}

export function findEligibleAncestor(from: Element | null): HTMLElement | null {
  let current: Element | null = from;
  while (current) {
    if (isDirectlyEligible(current)) {
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
  while (active) {
    if (
      isCrossRealmHtmlElement(active) &&
      active.shadowRoot?.activeElement
    ) {
      active = active.shadowRoot.activeElement;
      continue;
    }
    if (isIframeElement(active)) {
      try {
        const doc = active.contentDocument;
        const inner = doc?.activeElement;
        if (inner && inner !== active) {
          active = inner;
          continue;
        }
      } catch {
        break;
      }
    }
    break;
  }
  return active;
}

export function isEligibleElement(el: Element | null): el is HTMLElement {
  return isDirectlyEligible(el);
}

export function isContentEditableTarget(el: HTMLElement): boolean {
  return isRichTextEditable(el) || el.isContentEditable;
}

function resolveFromNode(node: EventTarget | Node | null): HTMLElement | null {
  const el = asElement(node);
  if (el && isIframeElement(el)) {
    return findEditableInFrame(el);
  }
  return findEligibleAncestor(el);
}

export function resolveEligibleElement(
  target: EventTarget | null,
  composedPath: EventTarget[] = [],
): HTMLElement | null {
  for (const node of composedPath) {
    const found = resolveFromNode(node as Node | null);
    if (found) return found;
  }

  const fromTarget = resolveFromNode(target as Node | null);
  if (fromTarget) return fromTarget;

  const deepActive = getDeepActiveElement();
  if (deepActive && isIframeElement(deepActive)) {
    return findEditableInFrame(deepActive);
  }
  return findEligibleAncestor(deepActive);
}

export function isMultilineElement(el: HTMLElement): boolean {
  if (isTextAreaElement(el)) return true;
  if (!isRichTextEditable(el) && !el.isContentEditable) return false;
  const style = getComputedStyle(el);
  if (style.whiteSpace.startsWith('pre')) return true;
  return el.scrollHeight > parseFloat(style.lineHeight || '20') * 1.8;
}

export function normalizeContent(content: string, multiline: boolean): string {
  if (multiline) return content;
  return content.replace(/\r?\n/g, ' ');
}
