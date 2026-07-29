import { type ShellViewName } from '../shellItems';

export interface ShellHomeProps {
  hidden: boolean;
  onOpen(view: ShellViewName): void;
}
