export type ShellEditTarget =
  | { kind: 'question'; global: boolean; name: string }
  | { kind: 'package'; name: string };
