import { createEmptyGameQuestion } from '@schdk/common';

export const gameQuestion = {
  ...createEmptyGameQuestion(),
  questionParts: ['Яке питання показати?'],
  answer: 'Приклад відповіді',
  alternativeAnswers: ['Альтернатива'],
  aiGeneration: {
    rule: 'Логічне питання',
    difficulty: 'medium' as const,
    recognizability: 'easy' as const,
  },
};
