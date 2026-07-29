import { type CustomGameElementBase } from './custom-game-element-base';

export interface CustomTextElement extends CustomGameElementBase {
  kind: 'text';
  text: string;
}
