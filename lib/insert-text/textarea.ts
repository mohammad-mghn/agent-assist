export function replaceTextareaTrigger(
  el: HTMLTextAreaElement,
  start: number,
  end: number,
  content: string,
): void {
  const wasReadOnly = el.readOnly;
  const wasDisabled = el.disabled;
  if (wasReadOnly) el.readOnly = false;
  if (wasDisabled) el.disabled = false;

  try {
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + content + after;
    const caret = before.length + content.length;
    el.selectionStart = el.selectionEnd = caret;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  } finally {
    if (wasReadOnly) el.readOnly = true;
    if (wasDisabled) el.disabled = true;
  }
}
