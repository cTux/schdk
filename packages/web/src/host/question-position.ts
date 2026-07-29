import { type GamePosition } from './game-position';

export type QuestionPosition = Omit<GamePosition, 'questionIndex'>;
