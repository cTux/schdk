import type { AIQuestion } from '@schdk/common';

export const EMPTY_QUESTION: AIQuestion = {
  name: '',
  description: '',
  goodExamples: '',
  badExamples: '',
  enabled: true,
  favorite: false,
  generalRule: false,
};
