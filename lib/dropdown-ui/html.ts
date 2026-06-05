export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderShortcutHighlight(
  trigger: string,
  shortcut: string,
  query: string,
): string {
  const full = `${trigger}${shortcut}`;
  if (!query) return escapeHtml(full);
  const qLen = query.length;
  const isExact = shortcut.toLowerCase() === query.toLowerCase();
  const triggerPart = escapeHtml(trigger);
  const matchPart = escapeHtml(shortcut.slice(0, qLen));
  const rest = escapeHtml(shortcut.slice(qLen));
  const hlClass = isExact ? 'hl-exact' : 'hl';
  return `${triggerPart}<span class="${hlClass}">${matchPart}</span>${rest}`;
}
