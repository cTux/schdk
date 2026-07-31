import { type CustomGameElementBase } from './custom-game-element-base.js';

export interface CustomImageElement extends CustomGameElementBase {
  kind: 'image';
  image: string | null;
}
