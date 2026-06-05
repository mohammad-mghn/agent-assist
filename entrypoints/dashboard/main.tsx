import '@/assets/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyUiThemeToDocument, loadUiTheme } from '@/lib/ui-theme';
import { applyUiLocaleToDocument, loadUiLocale } from '@/lib/ui-locale';
import App from './App';

const root = document.getElementById('root');
if (root) {
  void Promise.all([loadUiTheme(), loadUiLocale()]).then(([theme, locale]) => {
    applyUiThemeToDocument(theme);
    applyUiLocaleToDocument(locale);
  });
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
