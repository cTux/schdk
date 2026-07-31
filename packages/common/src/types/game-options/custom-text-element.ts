import { type CustomGameElementBase } from './custom-game-element-base.js';

export interface CustomTextElement extends CustomGameElementBase {
  kind: 'text';
  text: string;
}
