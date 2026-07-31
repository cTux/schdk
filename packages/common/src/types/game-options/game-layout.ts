import { type GameLayoutElementId } from './game-layout-element-id.js';
import { type GameLayoutPosition } from './game-layout-position.js';

export type GameLayout = Record<GameLayoutElementId, GameLayoutPosition>;
