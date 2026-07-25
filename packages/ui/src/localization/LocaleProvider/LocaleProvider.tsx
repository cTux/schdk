import { createContext, useContext, useMemo } from 'react';
import {
  LOCALIZATION_COPY,
  type AppLocale,
  type LocalizationCopy,
} from '../copy';
import type { LocaleProviderProps } from './types';

interface LocaleContextValue {
  copy: LocalizationCopy;
  locale: AppLocale;
  onLocaleChange(locale: AppLocale): void;
}

const LocaleContext = createContext<LocaleContextValue>({
  copy: LOCALIZATION_COPY.uk,
  locale: 'uk',
  onLocaleChange: () => undefined,
});

export function LocaleProvider({
  children,
  locale,
  onLocaleChange,
}: LocaleProviderProps) {
  const value = useMemo(
    () => ({
      copy: LOCALIZATION_COPY[locale],
      locale,
      onLocaleChange,
    }),
    [locale, onLocaleChange],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocalization() {
  return useContext(LocaleContext);
}
