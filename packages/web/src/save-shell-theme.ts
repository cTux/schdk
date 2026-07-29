import type { AppTheme } from '@schdk/ui/options';
import { THEME_KEY } from './theme-key';

export function saveShellTheme(theme: AppTheme) {
  localStorage.setItem(THEME_KEY, theme);
}
