const RTL_SCRIPT_RE =
  /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const LATIN_RE = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/;

export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  const trimmed = text.trim();
  if (!trimmed) return 'ltr';

  for (const char of trimmed) {
    if (RTL_SCRIPT_RE.test(char)) return 'rtl';
    if (LATIN_RE.test(char)) return 'ltr';
  }

  return 'ltr';
}

export function detectTextLang(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  if (/[\u0600-\u06FF]/.test(trimmed)) return 'ar';
  if (/[\u0590-\u05FF]/.test(trimmed)) return 'he';
  if (/[\u0600-\u06FF\uFB50-\uFDFF]/.test(trimmed) && /[\u067E\u0686\u0698\u06AF]/.test(trimmed)) {
    return 'fa';
  }
  if (RTL_SCRIPT_RE.test(trimmed)) return 'ar';
  if (LATIN_RE.test(trimmed)) return undefined;

  return undefined;
}
