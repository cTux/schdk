import { type AIQuestion } from '@schdk/common';

export interface PackageGenerationInput {
  template: AIQuestion;
  context: string;
}
