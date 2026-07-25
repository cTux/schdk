import { english } from './english';
import { ukrainian } from './ukrainian';

export type AppLocale = 'uk' | 'en';
export type LocalizationCopy = typeof ukrainian;

export const LOCALIZATION_COPY: Record<AppLocale, LocalizationCopy> = {
  uk: ukrainian,
  en: english,
};
