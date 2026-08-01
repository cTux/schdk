import { type GameQuestionGenerationRequest } from './game-question-generation-request.js';

export interface GenerateGameQuestionInput extends GameQuestionGenerationRequest {
  apiKey: string;
  abortSignal?: AbortSignal;
}
