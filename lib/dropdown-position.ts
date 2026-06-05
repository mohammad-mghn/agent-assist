export function dropdownPosition(rect: DOMRect): { left: number; top: number } {
  return {
    left: Math.min(rect.left, window.innerWidth - 320),
    top: Math.min(rect.bottom + 4, window.innerHeight - 8),
  };
}
