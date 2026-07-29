import { english } from './english';
import { ukrainian } from './ukrainian';
import { type AppLocale } from './app-locale';
import { type LocalizationCopy } from './localization-copy';

const LOCALIZATION_COPY: Record<AppLocale, LocalizationCopy> = {
  uk: ukrainian,
  en: english,
};

export { type AppLocale, type LocalizationCopy, LOCALIZATION_COPY };
