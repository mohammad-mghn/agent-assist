export function getCaretRect(el: HTMLElement): DOMRect {
  if (el.tagName === 'TEXTAREA') {
    return getTextareaCaretRect(el as HTMLTextAreaElement);
  }
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rects = range.getClientRects();
    if (rects.length > 0) return rects[0]!;
  }
  return el.getBoundingClientRect();
}

function getTextareaCaretRect(el: HTMLTextAreaElement): DOMRect {
  const pos = el.selectionStart ?? 0;
  const div = document.createElement('div');
  const style = getComputedStyle(el);
  for (const prop of [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'padding',
    'border',
    'boxSizing',
    'width',
    'whiteSpace',
    'wordWrap',
    'direction',
    'textAlign',
  ] as const) {
    div.style[prop] = style[prop];
  }
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.overflow = 'hidden';
  div.style.width = `${el.offsetWidth}px`;
  div.style.height = `${el.clientHeight}px`;
  div.scrollTop = el.scrollTop;
  div.scrollLeft = el.scrollLeft;
  const text = el.value.substring(0, pos);
  div.textContent = text;
  const span = document.createElement('span');
  span.textContent = el.value.substring(pos) || '.';
  div.appendChild(span);
  document.body.appendChild(div);
  const divRect = div.getBoundingClientRect();
  const rect = span.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  document.body.removeChild(div);
  return new DOMRect(
    elRect.left + rect.left - divRect.left,
    elRect.top + rect.top - divRect.top + parseFloat(style.lineHeight || '16'),
    0,
    parseFloat(style.lineHeight || '16'),
  );
}
