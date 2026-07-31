import { QUESTION_TYPE_CONFIG } from '../../constants/game-questions/question-type-config.js';

export type GameQuestionType = keyof typeof QUESTION_TYPE_CONFIG;
