import type { AppLocale } from '@schdk/ui/localization';
import type { AppTheme } from '@schdk/ui/options';

const LOCALE_KEY = 'schdk.shell.locale';
const THEME_KEY = 'schdk.shell.theme';

export function loadShellLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored === 'uk' || stored === 'en' ? stored : 'uk';
}

export function saveShellLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

export function loadShellTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function saveShellTheme(theme: AppTheme) {
  localStorage.setItem(THEME_KEY, theme);
}
