import { type GameQuestion } from './game-question.js';

export interface ValidatableGamePackage {
  title: string;
  questions: GameQuestion[];
}
