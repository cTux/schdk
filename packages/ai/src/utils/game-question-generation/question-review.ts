import { type GameQuestion } from '@schdk/common';
import { generateText, jsonSchema, Output, type LanguageModel } from 'ai';
import type { ExistingQuestionReference } from '../../services/game-question-generation/game-question-prompt.js';

interface QuestionReview {
  acceptable: boolean;
  feedback: string;
}

const questionReviewSchema = jsonSchema<QuestionReview>({
  type: 'object',
  additionalProperties: false,
  properties: {
    acceptable: {
      type: 'boolean',
      description: 'Whether the candidate passes every material quality check.',
    },
    feedback: {
      type: 'string',
      description:
        'Concise actionable defects to correct, or an empty string when acceptable.',
    },
  },
  required: ['acceptable', 'feedback'],
});

export async function reviewGameQuestion(
  model: LanguageModel,
  locale: 'uk' | 'en',
  generationRequest: string,
  question: GameQuestion & { imagePrompt?: string },
  existingQuestions: ExistingQuestionReference[],
) {
  const result = await generateText({
    model,
    output: Output.object({
      name: 'game_question_review',
      description: 'Strict game-question quality and uniqueness review.',
      schema: questionReviewSchema,
    }),
    system:
      locale === 'uk'
        ? 'Ти суворий редактор питань для гри «Що? Де? Коли?». Прийми кандидата лише якщо він відповідає запиту, фактично узгоджений, однозначно розв’язуваний із наведених підказок, не видає відповідь, звучить природно, не містить службового тексту, а коментар стисло й достатньо доводить правильність відповіді. Не відхиляй кандидата лише через однакову відповідь з іншим питанням. Відхили повтор центрального факту, логіки чи суттєвої послідовності підказок, навіть іншими словами. Якщо кандидат містить imagePrompt, вважай його описом зображення, яке буде створено після схвалення; перевір, що опис виконує запит, не видає відповідь і не містить службового тексту. Не вимагай готового зображення або data URL. Не вимагай косметичних змін. Якщо відхиляєш, feedback має містити лише конкретні виправлення, які може виконати генератор.'
        : 'You are a strict What? Where? When? question editor. Accept the candidate only when it follows the request, is factually coherent, has one supportable answer derivable from sufficient clues, does not reveal the answer, reads naturally, contains no internal construction text, and has a concise answer comment that sufficiently establishes why the answer is correct. Do not reject a candidate merely because another question has the same answer. Reject repetition of a central fact, logic, or material clue sequence even with different wording. When a candidate has imagePrompt, treat it as the image description that will be generated after approval; verify that it follows the request, does not reveal the answer, and contains no internal text. Do not demand a finished image or data URL. Do not demand cosmetic changes. When rejecting, put only concrete corrections that the generator can perform in feedback.',
    prompt: `${locale === 'uk' ? 'Запит на генерацію' : 'Generation request'}: ${generationRequest}

${locale === 'uk' ? 'Схожі наявні питання' : 'Similar existing questions'}: ${JSON.stringify(existingQuestions)}

${locale === 'uk' ? 'Кандидат' : 'Candidate'}: ${JSON.stringify(question)}`,
  });
  return result.output;
}
