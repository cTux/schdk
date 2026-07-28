export type { ShellViewProps } from './ShellView';
export type { ShellViewName } from '../shellItems';

export type ShellEditTarget =
  | { kind: 'question'; global: boolean; name: string }
  | { kind: 'package'; name: string };
