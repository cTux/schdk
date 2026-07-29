import {
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '@schdk/common';
import { type ExistingQuestionReference } from './existing-question-reference.js';

export interface GameQuestionGenerationRequest {
  provider: string;
  model: string;
  locale: 'uk' | 'en';
  template: AIQuestion;
  context: string;
  difficulty: AIQuestionDifficulty;
  recognizability: AIQuestionRecognizability;
  excludedAnswers: string[];
  existingQuestions: ExistingQuestionReference[];
}
