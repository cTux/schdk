import { type AIQuestion } from '@schdk/common';

export const aiQuestion: AIQuestion = {
  name: 'Логічне питання',
  description: 'Створюй короткі питання з однозначною відповіддю.',
  goodExamples: 'Питання з непрямою підказкою.',
  badExamples: 'Питання, що прямо називає відповідь.',
  enabled: true,
  favorite: false,
  generalRule: false,
};
