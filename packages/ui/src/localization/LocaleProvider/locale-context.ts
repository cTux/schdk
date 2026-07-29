import { createContext } from 'react';
import { LOCALIZATION_COPY } from '../copy';
import { type LocaleContextValue } from './locale-context-value';

export const LocaleContext = createContext<LocaleContextValue>({
  copy: LOCALIZATION_COPY.uk,
  locale: 'uk',
  onLocaleChange: () => undefined,
});
