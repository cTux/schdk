import {
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from './ai-question.js';

export interface AIQuestionGenerationMetadata {
  rule: string;
  difficulty: AIQuestionDifficulty;
  recognizability: AIQuestionRecognizability;
}
