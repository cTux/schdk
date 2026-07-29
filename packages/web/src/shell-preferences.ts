import type { AppLocale } from '@schdk/ui/localization';
import { LOCALE_KEY } from './locale-key';
import { saveShellLocale } from './save-shell-locale';
import { loadShellTheme } from './load-shell-theme';
import { saveShellTheme } from './save-shell-theme';

function loadShellLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored === 'uk' || stored === 'en' ? stored : 'uk';
}

export { loadShellLocale, saveShellLocale, loadShellTheme, saveShellTheme };
