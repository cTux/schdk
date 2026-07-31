import type {
  AIQuestion,
  AIQuestionDifficulty,
  AIQuestionRecognizability,
  AIQuestionsPackage,
  GameQuestion,
  SchdkDictionaryDistribution,
  SchdkDictionaryItem,
} from '@schdk/common';

export interface AiQuestionGenerationRequest {
  template: AIQuestion;
  context: string;
  excludedAnswers?: string[];
  difficulty?: AIQuestionDifficulty;
  recognizability?: AIQuestionRecognizability;
}

export interface AiPackageGenerationRequest {
  steps: Array<AiQuestionGenerationRequest & { index: number }>;
  excludedAnswers: string[];
  difficultyDistribution: SchdkDictionaryDistribution;
  recognizabilityDistribution: SchdkDictionaryDistribution;
}

export interface AiPackageGenerationProgress {
  index: number;
  position: number;
  total: number;
  question: GameQuestion;
  request: Required<
    Pick<AiQuestionGenerationRequest, 'difficulty' | 'recognizability'>
  > &
    AiQuestionGenerationRequest;
}

export interface AiQuestionGenerationOptions {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  packages: AIQuestionsPackage[];
  difficulties: SchdkDictionaryItem[];
  recognizabilities: SchdkDictionaryItem[];
  difficultyDistributions: SchdkDictionaryItem[];
  recognizabilityDistributions: SchdkDictionaryItem[];
  getPromptPreview?(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    recognizability?: AIQuestionRecognizability,
  ): string;
  generateQuestion(
    request: AiQuestionGenerationRequest,
    signal?: AbortSignal,
  ): Promise<GameQuestion>;
  generatePackage(
    request: AiPackageGenerationRequest,
    onProgress: (progress: AiPackageGenerationProgress) => void,
    signal?: AbortSignal,
  ): Promise<void>;
  onQuestionGenerationStateChange?(generating: boolean, docked: boolean): void;
  excludedAnswers?: string[];
}
