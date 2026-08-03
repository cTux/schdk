import type { AppTheme } from '@schdk/common/app-settings';
import { THEME_KEY } from '../../constants/shell/theme-key';

export function loadShellTheme(): AppTheme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}
