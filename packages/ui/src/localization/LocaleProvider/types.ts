import type { ReactNode } from 'react';
import type { AppLocale } from '../copy';

export interface LocaleProviderProps {
  children: ReactNode;
  locale: AppLocale;
  onLocaleChange(locale: AppLocale): void;
}
