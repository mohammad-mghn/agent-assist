import { CONTENT_EDITABLE_DELETE_RE } from './constants';

export function replaceContentEditableTrigger(
  el: HTMLElement,
  triggerText: string,
  content: string,
): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let remaining = triggerText.length;
  const nodes: { node: Text; start: number; end: number }[] = [];

  let textNode: Text | null = null;
  const endContainer = range.startContainer;
  const endOffset = range.startOffset;

  const allText: { node: Text; start: number; end: number }[] = [];
  while ((textNode = walker.nextNode() as Text | null)) {
    const len = textNode.length;
    allText.push({ node: textNode, start: 0, end: len });
  }

  let cursor = 0;
  let endGlobal = 0;
  for (const item of allText) {
    const nodeEnd = cursor + item.node.length;
    if (
      item.node === endContainer ||
      item.node.contains(endContainer as Node)
    ) {
      endGlobal = cursor + endOffset;
      break;
    }
    if (endContainer.nodeType === Node.TEXT_NODE && item.node === endContainer) {
      endGlobal = cursor + endOffset;
      break;
    }
    cursor = nodeEnd;
  }

  if (endContainer.nodeType === Node.TEXT_NODE) {
    for (const item of allText) {
      if (item.node === endContainer) {
        endGlobal =
          allText
            .slice(0, allText.indexOf(item))
            .reduce((s, t) => s + t.node.length, 0) + endOffset;
        break;
      }
    }
  }

  const fullText = allText.map((t) => t.node.textContent ?? '').join('');
  const beforeCaret = fullText.slice(0, endGlobal);
  const match = beforeCaret.match(CONTENT_EDITABLE_DELETE_RE);
  if (!match) return;

  const deleteLen = match[1].length;
  const deleteStart = endGlobal - deleteLen;

  let pos = 0;
  for (const item of allText) {
    const nodeStart = pos;
    const nodeEnd = pos + item.node.length;
    if (deleteStart < nodeEnd && remaining > 0) {
      const localStart = Math.max(0, deleteStart - nodeStart);
      const localEnd =
        endGlobal <= nodeEnd
          ? endGlobal - nodeStart
          : item.node.length;
      nodes.push({
        node: item.node,
        start: localStart,
        end: Math.min(localEnd, item.node.length),
      });
    }
    pos = nodeEnd;
  }

  if (nodes.length === 0) {
    document.execCommand('insertText', false, content);
    return;
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const deleteRange = document.createRange();
  deleteRange.setStart(first.node, first.start);
  deleteRange.setEnd(last.node, last.end);
  deleteRange.deleteContents();
  const textNodeInsert = document.createTextNode(content);
  deleteRange.insertNode(textNodeInsert);

  const newRange = document.createRange();
  newRange.setStartAfter(textNodeInsert);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
