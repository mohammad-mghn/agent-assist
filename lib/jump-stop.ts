export interface JumpStop {
  start: number;
  end: number;
  innerStart: number;
  innerEnd: number;
}

const JUMP_STOP_RE = /<<([^>]*)>>/g;
const JUMP_STOP_NUMBER_RE = /<<(\d+)>>/g;

export function findJumpStops(text: string): JumpStop[] {
  const stops: JumpStop[] = [];
  const re = new RegExp(JUMP_STOP_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    stops.push({
      start: match.index,
      end: match.index + match[0].length,
      innerStart: match.index + 2,
      innerEnd: match.index + 2 + match[1].length,
    });
  }
  return stops;
}

export function getNextJumpStopNumber(text: string): number {
  let max = 0;
  const re = new RegExp(JUMP_STOP_NUMBER_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const value = Number.parseInt(match[1], 10);
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return max + 1;
}

export function insertJumpStopMarker(
  text: string,
  selectionStart: number,
  selectionEnd: number,
): { text: string; selectStart: number; selectEnd: number } {
  const nextNum = getNextJumpStopNumber(text);
  const marker = `<<${nextNum}>>`;
  const newText = text.slice(0, selectionStart) + marker + text.slice(selectionEnd);
  return {
    text: newText,
    selectStart: selectionStart,
    selectEnd: selectionStart + marker.length,
  };
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getActiveJumpStop(
  text: string,
  selectionStart: number,
  selectionEnd: number,
): JumpStop | null {
  for (const stop of findJumpStops(text)) {
    if (
      rangesOverlap(selectionStart, selectionEnd, stop.start, stop.end) ||
      (selectionStart === selectionEnd &&
        selectionStart >= stop.start &&
        selectionStart <= stop.end)
    ) {
      return stop;
    }
  }
  return null;
}

export function getNextJumpStop(
  text: string,
  current: JumpStop,
): JumpStop | null {
  const stops = findJumpStops(text);
  const index = stops.findIndex((stop) => stop.start === current.start);
  return index >= 0 && index < stops.length - 1 ? stops[index + 1]! : null;
}

function getRangeTextOffset(
  el: HTMLElement,
  container: Node,
  offset: number,
): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.setEnd(container, offset);
  return range.toString().length;
}

export function getContentEditableText(el: HTMLElement): string {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.toString();
}

export function setContentEditableSelection(
  el: HTMLElement,
  start: number,
  end: number,
): void {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let pos = 0;
  let startSet = false;
  let lastText: Text | null = null;
  let textNode: Text | null;

  while ((textNode = walker.nextNode() as Text | null)) {
    lastText = textNode;
    const len = textNode.length;
    const nodeEnd = pos + len;

    if (!startSet && start <= nodeEnd) {
      range.setStart(textNode, Math.max(0, start - pos));
      startSet = true;
    }

    if (startSet && end <= nodeEnd) {
      range.setEnd(textNode, Math.max(0, end - pos));
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    pos = nodeEnd;
  }

  if (!startSet) {
    range.selectNodeContents(el);
    range.collapse(false);
  } else if (lastText) {
    range.setEnd(lastText, lastText.length);
  }

  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getContentEditableSelection(el: HTMLElement): {
  start: number;
  end: number;
} {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };

  const range = selection.getRangeAt(0);
  if (!el.contains(range.startContainer) && !el.contains(range.endContainer)) {
    return { start: 0, end: 0 };
  }

  return {
    start: getRangeTextOffset(el, range.startContainer, range.startOffset),
    end: getRangeTextOffset(el, range.endContainer, range.endOffset),
  };
}

function getElementText(el: HTMLElement): string {
  return el instanceof HTMLTextAreaElement
    ? el.value
    : getContentEditableText(el);
}

function getElementSelection(el: HTMLElement): { start: number; end: number } {
  if (el instanceof HTMLTextAreaElement) {
    return {
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    };
  }
  return getContentEditableSelection(el);
}

function scheduleSelectJumpStop(el: HTMLElement, stop: JumpStop): void {
  scheduleElementSelection(el, stop.start, stop.end);
}

export function scheduleElementSelection(
  el: HTMLElement,
  start: number,
  end: number,
): void {
  const apply = () => {
    if (!el.isConnected) return;
    el.focus({ preventScroll: true });
    if (el instanceof HTMLTextAreaElement) {
      el.selectionStart = start;
      el.selectionEnd = end;
      return;
    }
    setContentEditableSelection(el, start, end);
  };

  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
}

export function selectJumpStop(el: HTMLElement, stop: JumpStop): void {
  el.focus({ preventScroll: true });
  if (el instanceof HTMLTextAreaElement) {
    el.selectionStart = stop.start;
    el.selectionEnd = stop.end;
    return;
  }
  setContentEditableSelection(el, stop.start, stop.end);
}

export function focusFirstJumpStopInElement(el: HTMLElement): boolean {
  const stops = findJumpStops(getElementText(el));
  if (stops.length === 0) return false;
  scheduleSelectJumpStop(el, stops[0]!);
  return true;
}

export function tryAdvanceJumpStopInElement(el: HTMLElement): boolean {
  const text = getElementText(el);
  const stops = findJumpStops(text);
  if (stops.length === 0) return false;

  const selection = getElementSelection(el);
  const current = getActiveJumpStop(text, selection.start, selection.end);

  let next: JumpStop | null = null;
  if (current) {
    next = getNextJumpStop(text, current);
  } else {
    next = stops.find((stop) => stop.start >= selection.start) ?? null;
  }

  if (!next) return false;

  scheduleSelectJumpStop(el, next);
  return true;
}

export function tryHandleJumpStopKeydown(
  e: KeyboardEvent,
  el: HTMLElement,
): boolean {
  if (e.key !== 'Tab' && e.key !== 'Enter') return false;
  if (!tryAdvanceJumpStopInElement(el)) return false;
  e.preventDefault();
  return true;
}
