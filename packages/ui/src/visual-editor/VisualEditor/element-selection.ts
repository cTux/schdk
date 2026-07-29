import type { GameLayoutElementId } from '../../options/types';

export type ElementSelection =
  | { kind: 'built-in'; id: GameLayoutElementId }
  | { kind: 'custom'; id: string };
