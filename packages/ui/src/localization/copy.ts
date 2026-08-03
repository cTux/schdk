import { english } from './english';
import { ukrainian } from './ukrainian';
import { type LocalizationCopy } from './localization-copy';
import type { AppLocale } from '@schdk/common/app-settings';

const LOCALIZATION_COPY: Record<AppLocale, LocalizationCopy> = {
  uk: ukrainian,
  en: english,
};

export { type AppLocale, type LocalizationCopy, LOCALIZATION_COPY };
