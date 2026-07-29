import type { AppTheme } from '@schdk/ui/options';
import { THEME_KEY } from './theme-key';

export function loadShellTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}
