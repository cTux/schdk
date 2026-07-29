import type { AppLocale } from '@schdk/ui/localization';
import { LOCALE_KEY } from './locale-key';

export function saveShellLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_KEY, locale);
}
