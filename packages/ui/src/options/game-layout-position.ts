import { type GameTextGrowDirection } from './game-text-grow-direction';
import { type GameImagePosition } from './game-image-position';

export interface GameLayoutPosition {
  hidden: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fontScale: number;
  fitTextToHeight: boolean;
  textColor: string;
  textGrowDirection: GameTextGrowDirection;
  imagePosition: GameImagePosition;
}
