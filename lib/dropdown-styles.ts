import type { UiTheme } from '@/shared/types';

export function buildDropdownStyles(theme: UiTheme): string {
  const t =
    theme === 'dark'
      ? {
          panelBg: '#18181b',
          panelBorder: '#3f3f46',
          shadow: 'rgba(0,0,0,.45)',
          rowActive: '#27272a',
          idx: '#a1a1aa',
          name: '#fafafa',
          shortcut: '#a1a1aa',
          preview: '#a1a1aa',
          empty: '#a1a1aa',
        }
      : {
          panelBg: '#ffffff',
          panelBorder: '#e4e4e7',
          shadow: 'rgba(0,0,0,.12)',
          rowActive: '#f4f4f5',
          idx: '#71717a',
          name: '#18181b',
          shortcut: '#52525b',
          preview: '#71717a',
          empty: '#71717a',
        };

  return `
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: 2147483647;
  pointer-events: none;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.4;
}
.panel {
  position: fixed;
  pointer-events: auto;
  z-index: 2147483647;
  min-width: 320px;
  max-width: 420px;
  max-height: 280px;
  overflow-y: auto;
  background: ${t.panelBg};
  border: 1px solid ${t.panelBorder};
  border-radius: 8px;
  box-shadow: 0 10px 40px ${t.shadow};
  padding: 4px;
}
.row {
  display: grid;
  grid-template-columns: 20px 1fr auto auto;
  gap: 6px 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  align-items: start;
}
.row.active {
  background: ${t.rowActive};
}
.idx {
  color: ${t.idx};
  font-size: 11px;
  padding-top: 2px;
}
.name {
  font-weight: 600;
  color: ${t.name};
  grid-column: 2;
}
.shortcut-wrap {
  grid-column: 3;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: ${t.shortcut};
  white-space: nowrap;
}
.hl {
  color: #2563eb;
  font-weight: 600;
}
.hl-exact {
  color: #16a34a;
  font-weight: 600;
}
.chip {
  grid-column: 4;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  color: #fff;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview {
  grid-column: 2 / -1;
  color: ${t.preview};
  font-size: 11px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty {
  padding: 12px;
  color: ${t.empty};
  text-align: center;
}
`;
}
