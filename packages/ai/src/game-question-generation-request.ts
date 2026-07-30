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
  difficultyPrompt: string;
  recognizability: AIQuestionRecognizability;
  recognizabilityPrompt: string;
  excludedAnswers: string[];
  existingQuestions: ExistingQuestionReference[];
}
