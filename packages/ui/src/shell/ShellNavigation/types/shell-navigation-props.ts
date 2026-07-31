import { type ShellViewName } from '../../shellItems';

export interface ShellNavigationProps {
  preloading: boolean;
  view: ShellViewName;
  onSelect(view: ShellViewName): void;
}
