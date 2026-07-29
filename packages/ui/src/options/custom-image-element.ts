import { type CustomGameElementBase } from './custom-game-element-base';

export interface CustomImageElement extends CustomGameElementBase {
  kind: 'image';
  image: string | null;
}
