import { type ShellViewName } from '../shellItems';
import { type ShellAccount } from './shell-account';

export interface ShellNavigationProps {
  account?: ShellAccount;
  connected: boolean;
  preloading: boolean;
  view: ShellViewName;
  onSelect(view: ShellViewName): void;
}
