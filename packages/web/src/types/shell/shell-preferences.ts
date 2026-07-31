import type { AppLocale } from '@schdk/ui/localization';
import { LOCALE_KEY } from '../../constants/shell/locale-key';
import { saveShellLocale } from '../../storage/shell/save-shell-locale';
import { loadShellTheme } from '../../storage/shell/load-shell-theme';
import { saveShellTheme } from '../../storage/shell/save-shell-theme';

const UI_ANIMATIONS_KEY = 'schdk-ui-animations';

function loadShellLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored === 'uk' || stored === 'en' ? stored : 'uk';
}

function loadUiAnimations(): boolean {
  return localStorage.getItem(UI_ANIMATIONS_KEY) !== 'false';
}

function saveUiAnimations(enabled: boolean): void {
  localStorage.setItem(UI_ANIMATIONS_KEY, String(enabled));
}

export {
  loadShellLocale,
  saveShellLocale,
  loadShellTheme,
  saveShellTheme,
  loadUiAnimations,
  saveUiAnimations,
};
