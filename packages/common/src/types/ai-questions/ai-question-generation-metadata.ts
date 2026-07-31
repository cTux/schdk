import {
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '../../contracts/ai-questions/ai-question.js';

export interface AIQuestionGenerationMetadata {
  rule: string;
  difficulty: AIQuestionDifficulty;
  recognizability: AIQuestionRecognizability;
}
