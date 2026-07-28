import { getGameQuestionAnswers, type GameQuestion } from '@schdk/common';
import { generateText, jsonSchema, Output, type LanguageModel } from 'ai';
import type { ExistingQuestionReference } from './game-question-prompt.js';

const answerDiversitySchema = jsonSchema<{ acceptable: boolean }>({
  type: 'object',
  additionalProperties: false,
  properties: {
    acceptable: {
      type: 'boolean',
      description:
        'Whether the candidate differs semantically from the supplied questions and answers.',
    },
  },
  required: ['acceptable'],
});

export async function hasDiverseAnswer(
  model: LanguageModel,
  locale: 'uk' | 'en',
  question: GameQuestion,
  excludedAnswers: string[],
  existingQuestions: ExistingQuestionReference[] = [],
) {
  if (!excludedAnswers.length && !existingQuestions.length) return true;
  const result = await generateText({
    model,
    output: Output.object({
      name: 'question_diversity_review',
      description: 'Semantic question and answer uniqueness review.',
      schema: answerDiversitySchema,
    }),
    system:
      locale === 'uk'
        ? 'Перевір нове питання та відповідь. Відхили його, якщо відповідь позначає ту саму сутність, що й використана відповідь, або якщо питання повторює центральний факт, логіку чи суттєву послідовність підказок наявного питання, навіть іншими словами. Також відхили надмірне повторення типу сутності чи форми відповіді.'
        : 'Review the new question and answer. Reject it when the answer denotes the same entity as a used answer, or when the question repeats the central fact, logic, or material clue sequence of an existing question even with different wording. Also reject excessive repetition of an entity type or answer form.',
    prompt: `${locale === 'uk' ? 'Використані відповіді' : 'Used answers'}: ${JSON.stringify(excludedAnswers)}

${locale === 'uk' ? 'Схожі наявні питання' : 'Similar existing questions'}: ${JSON.stringify(existingQuestions)}

${locale === 'uk' ? 'Нове питання' : 'New question'}: ${JSON.stringify({
      question: question.questionParts,
      answers: getGameQuestionAnswers(question),
    })}`,
  });
  return result.output.acceptable;
}
