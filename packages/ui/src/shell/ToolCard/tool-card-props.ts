import type { ShellItem } from '../shellItems';

export interface ToolCardProps {
  item: ShellItem;
  onOpen(): void;
}
