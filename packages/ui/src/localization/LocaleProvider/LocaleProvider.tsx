import { useMemo } from 'react';
import { LOCALIZATION_COPY } from '../copy';
import type { LocaleProviderProps } from './types';
import { LocaleContext } from './locale-context';
import { useLocalization } from './use-localization';

function LocaleProvider({
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

export { LocaleProvider, useLocalization };
