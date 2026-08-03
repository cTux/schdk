import type { AppLocale } from '@schdk/common/app-settings';
import type { AppFont } from '@schdk/common/app-settings';
import { LOCALE_KEY } from '../../constants/shell/locale-key';
import { saveShellLocale } from '../../storage/shell/save-shell-locale';
import { loadShellTheme } from '../../storage/shell/load-shell-theme';
import { saveShellTheme } from '../../storage/shell/save-shell-theme';

const UI_ANIMATIONS_KEY = 'schdk-ui-animations';
const FONT_KEY = 'schdk.shell.font';

function loadShellLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored === 'uk' || stored === 'en' ? stored : 'uk';
}

function loadUiAnimations(): boolean {
  return localStorage.getItem(UI_ANIMATIONS_KEY) !== 'false';
}

function loadAppFont(): AppFont {
  const stored = localStorage.getItem(FONT_KEY);
  return stored === 'system' || stored === 'verdana' || stored === 'georgia'
    ? stored
    : 'comfortable';
}

function saveAppFont(font: AppFont): void {
  localStorage.setItem(FONT_KEY, font);
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
  loadAppFont,
  saveAppFont,
};
