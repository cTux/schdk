import { type GameTextGrowDirection } from './game-text-grow-direction.js';
import { type GameImagePosition } from './game-image-position.js';

export interface GameLayoutPosition {
  hidden: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fontScale: number;
  textColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textBold: boolean;
  textItalic: boolean;
  textUnderline: boolean;
  lineHeight: number;
  letterSpacing: number;
  textGrowDirection: GameTextGrowDirection;
  imagePosition: GameImagePosition;
  backgroundColor: string | null;
  backgroundGradientColor: string | null;
  backgroundGradientDirection: number;
  backgroundOpacity: number;
  borderRadius: number;
  contentOpacity: number;
}
