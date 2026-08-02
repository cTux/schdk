import { type ShellViewName } from '../../shellItems';

export interface ShellNavigationProps {
  initialCollapsed?: boolean;
  preloading: boolean;
  view: ShellViewName;
  onCollapsedChange?(collapsed: boolean): void;
  onSelect(view: ShellViewName): void;
}
