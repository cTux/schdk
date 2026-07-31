import { useContext } from 'react';
import { LocaleContext } from '../context/locale-context';

export function useLocalization() {
  return useContext(LocaleContext);
}
