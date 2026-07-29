import { type GameLayoutElementId } from './game-layout-element-id';
import { type GameLayoutPosition } from './game-layout-position';

export type GameLayout = Record<GameLayoutElementId, GameLayoutPosition>;
