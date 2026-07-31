import type { SchdkDictionaryId } from '@schdk/common';

export type ShellEditTarget =
  | { kind: 'question'; global: boolean; name: string }
  | { kind: 'package'; name: string }
  | { kind: 'dictionary'; id: SchdkDictionaryId };
