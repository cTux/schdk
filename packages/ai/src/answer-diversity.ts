import { getGameQuestionAnswers, type GameQuestion } from '@schdk/common';
import { generateText, jsonSchema, Output, type LanguageModel } from 'ai';

const answerDiversitySchema = jsonSchema<{ acceptable: boolean }>({
  type: 'object',
  additionalProperties: false,
  properties: {
    acceptable: {
      type: 'boolean',
      description:
        'Whether the candidate is a genuinely different entity and preserves answer diversity.',
    },
  },
  required: ['acceptable'],
});

export async function hasDiverseAnswer(
  model: LanguageModel,
  locale: 'uk' | 'en',
  question: GameQuestion,
  excludedAnswers: string[],
) {
  if (!excludedAnswers.length) return true;
  const result = await generateText({
    model,
    output: Output.object({
      name: 'answer_diversity_review',
      description: 'Semantic uniqueness and answer-diversity review.',
      schema: answerDiversitySchema,
    }),
    system:
      locale === 'uk'
        ? 'Перевір відповідь нового питання. Вона неприйнятна, якщо позначає ту саму сутність, що й будь-яка використана відповідь, зокрема через синонім, псевдонім, переклад, уточнення або описову назву. Вона також неприйнятна, якщо погіршує різноманітність пакета повторенням уже надмірно представленого типу сутності чи форми відповіді. Не вимагай, щоб усі 36 відповідей мали унікальні типи.'
        : 'Review a new question answer. Reject it when it denotes the same entity as any used answer, including through a synonym, alias, translation, qualification, or descriptive name. Also reject it when it reduces package diversity by repeating an already overrepresented entity type or answer form. Do not require all 36 answers to have unique types.',
    prompt: `${locale === 'uk' ? 'Використані відповіді' : 'Used answers'}: ${JSON.stringify(excludedAnswers)}

${locale === 'uk' ? 'Нова основна та альтернативні відповіді' : 'New main and alternative answers'}: ${JSON.stringify(getGameQuestionAnswers(question))}`,
  });
  return result.output.acceptable;
}
