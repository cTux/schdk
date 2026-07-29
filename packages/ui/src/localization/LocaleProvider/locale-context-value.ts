import { type AppLocale, type LocalizationCopy } from '../copy';

export interface LocaleContextValue {
  copy: LocalizationCopy;
  locale: AppLocale;
  onLocaleChange(locale: AppLocale): void;
}
