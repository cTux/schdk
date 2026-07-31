import { type GameQuestion } from '../../contracts/game-questions/game-question.js';

export interface ValidatableGamePackage {
  title: string;
  questions: GameQuestion[];
}
