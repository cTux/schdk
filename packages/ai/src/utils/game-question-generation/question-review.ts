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
  question: GameQuestion,
  excludedAnswers: string[],
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
        ? 'Ти суворий редактор питань для гри «Що? Де? Коли?». Прийми кандидата лише якщо він відповідає запиту, фактично узгоджений, однозначно розв’язуваний із наведених підказок, не видає відповідь, звучить природно, не містить службового тексту, а коментар стисло й достатньо доводить правильність відповіді. Також відхили повтор тієї самої сутності, центрального факту, логіки чи суттєвої послідовності підказок, навіть іншими словами, та надмірне повторення типу або форми відповіді. Не відхиляй кандидата через відсутність зображення чи іншої нетекстової роздатки: цей генератор створює лише текстову роздатку. Не вимагай косметичних змін. Якщо відхиляєш, feedback має містити лише конкретні виправлення, які може виконати генератор.'
        : 'You are a strict What? Where? When? question editor. Accept the candidate only when it follows the request, is factually coherent, has one supportable answer derivable from sufficient clues, does not reveal the answer, reads naturally, contains no internal construction text, and has a concise answer comment that sufficiently establishes why the answer is correct. Also reject repetition of the same entity, central fact, logic, or material clue sequence even with different wording, and excessive repetition of an answer type or form. Do not reject a candidate for a missing image or other non-text handout: this generator supports text handouts only. Do not demand cosmetic changes. When rejecting, put only concrete corrections that the generator can perform in feedback.',
    prompt: `${locale === 'uk' ? 'Запит на генерацію' : 'Generation request'}: ${generationRequest}

${locale === 'uk' ? 'Використані відповіді' : 'Used answers'}: ${JSON.stringify(excludedAnswers)}

${locale === 'uk' ? 'Схожі наявні питання' : 'Similar existing questions'}: ${JSON.stringify(existingQuestions)}

${locale === 'uk' ? 'Кандидат' : 'Candidate'}: ${JSON.stringify(question)}`,
  });
  return result.output;
}
