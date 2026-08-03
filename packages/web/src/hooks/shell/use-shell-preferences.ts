import { useEffect, useLayoutEffect, useState } from 'react';
import {
  loadAppFont,
  loadShellLocale,
  loadShellTheme,
  loadUiAnimations,
  saveAppFont,
  saveShellLocale,
  saveShellTheme,
  saveUiAnimations,
} from '../../types/shell/shell-preferences';

export function useShellPreferences() {
  const [locale, setLocale] = useState(loadShellLocale);
  const [theme, setTheme] = useState(loadShellTheme);
  const [font, setFont] = useState(loadAppFont);
  const [uiAnimations, setUiAnimations] = useState(loadUiAnimations);

  useEffect(() => {
    saveShellLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    saveShellTheme(theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useLayoutEffect(() => {
    saveAppFont(font);
    document.documentElement.dataset.font = font;
  }, [font]);
  useLayoutEffect(() => {
    saveUiAnimations(uiAnimations);
    document.documentElement.dataset.uiAnimations = String(uiAnimations);
  }, [uiAnimations]);

  return {
    font,
    locale,
    theme,
    uiAnimations,
    setFont,
    setLocale,
    setTheme,
    setUiAnimations,
  };
}
