import { useContext } from 'react';
import { LocaleContext } from './locale-context';

export function useLocalization() {
  return useContext(LocaleContext);
}
