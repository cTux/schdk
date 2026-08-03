import type { AppTheme } from '@schdk/common/app-settings';
import { THEME_KEY } from '../../constants/shell/theme-key';

export function saveShellTheme(theme: AppTheme) {
  localStorage.setItem(THEME_KEY, theme);
}
