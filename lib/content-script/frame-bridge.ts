const BOUND_ATTR = 'data-snippet-assist-bound';

export function isSnippetAssistDocument(doc: Document | null | undefined): boolean {
  return !!doc?.documentElement?.hasAttribute(BOUND_ATTR);
}

export function markSnippetAssistDocument(doc: Document): void {
  doc.documentElement.setAttribute(BOUND_ATTR, '');
}

type DocumentEventBinder = (doc: Document) => void;

function canAccessFrame(frame: HTMLIFrameElement): boolean {
  try {
    return !!frame.contentDocument;
  } catch {
    return false;
  }
}

function bindAccessibleFrame(
  frame: HTMLIFrameElement,
  bind: DocumentEventBinder,
): boolean {
  if (!canAccessFrame(frame) || isSnippetAssistDocument(frame.contentDocument)) {
    return false;
  }

  const doc = frame.contentDocument!;
  markSnippetAssistDocument(doc);
  bind(doc);
  return true;
}

function watchFrameUntilBound(
  frame: HTMLIFrameElement,
  bind: DocumentEventBinder,
): void {
  if (bindAccessibleFrame(frame, bind)) return;

  const doc = frame.contentDocument;
  if (!doc) {
    frame.addEventListener('load', () => watchFrameUntilBound(frame, bind), {
      once: true,
    });
    return;
  }

  const observer = new MutationObserver(() => {
    if (bindAccessibleFrame(frame, bind)) observer.disconnect();
  });
  observer.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['contenteditable', 'class'],
  });

  frame.addEventListener(
    'load',
    () => {
      if (bindAccessibleFrame(frame, bind)) observer.disconnect();
    },
    { once: true },
  );
}

function frameFromEventTarget(target: EventTarget | null): HTMLIFrameElement | null {
  const el =
    target && typeof target === 'object' && 'nodeType' in target
      ? (target as Element)
      : null;
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;
  if (el.tagName === 'IFRAME') return el as HTMLIFrameElement;
  return el.closest('iframe');
}

/**
 * Attach snippet-assist listeners to same-origin iframe documents that do not
 * already run their own content script (e.g. CKEditor wysiwyg frames).
 */
export function observeSnippetAssistFrames(bind: DocumentEventBinder): () => void {
  const bridge = (frame: HTMLIFrameElement) => watchFrameUntilBound(frame, bind);

  document.querySelectorAll('iframe').forEach((frame) => bridge(frame));

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          (node as Element).tagName === 'IFRAME'
        ) {
          bridge(node as HTMLIFrameElement);
        }
        if (node instanceof Element) {
          node.querySelectorAll('iframe').forEach((frame) => bridge(frame));
        }
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  const onFocusIn = (e: FocusEvent) => {
    const frame = frameFromEventTarget(e.target);
    if (frame) bridge(frame);
  };
  document.addEventListener('focusin', onFocusIn, true);

  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', onFocusIn, true);
  };
}
