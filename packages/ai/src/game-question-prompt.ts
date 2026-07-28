import type { AIQuestion } from '@schdk/common';

export interface GameQuestionGenerationRequest {
  provider: string;
  model: string;
  locale: 'uk' | 'en';
  template: AIQuestion;
  context: string;
  excludedAnswers: string[];
}

export interface GenerateGameQuestionInput extends GameQuestionGenerationRequest {
  apiKey: string;
}

export function assertGameQuestionGenerationInput(
  input: GenerateGameQuestionInput,
) {
  if (
    typeof input.provider !== 'string' ||
    typeof input.model !== 'string' ||
    typeof input.apiKey !== 'string' ||
    (input.locale !== 'uk' && input.locale !== 'en') ||
    !input.template ||
    typeof input.template.name !== 'string' ||
    typeof input.template.description !== 'string' ||
    typeof input.template.goodExamples !== 'string' ||
    typeof input.template.badExamples !== 'string' ||
    typeof input.context !== 'string' ||
    !Array.isArray(input.excludedAnswers) ||
    input.excludedAnswers.length > 1_000 ||
    input.excludedAnswers.some(
      (answer) => typeof answer !== 'string' || answer.length > 1_000,
    ) ||
    input.excludedAnswers.reduce(
      (length, answer) => length + answer.length,
      0,
    ) > 20_000 ||
    !input.apiKey.trim() ||
    input.apiKey.length > 16_384 ||
    !input.model.trim() ||
    input.model.length > 256 ||
    !input.context.trim() ||
    input.context.length > 20_000 ||
    !input.template.name.trim() ||
    !input.template.description.trim()
  ) {
    throw new TypeError('Invalid AI generation input');
  }
}

export function createGameQuestionPrompt(input: GameQuestionGenerationRequest) {
  const examples = input.locale === 'uk' ? 'Приклади' : 'Examples';
  const context = input.locale === 'uk' ? 'Контекст' : 'Context';
  const excludedAnswers =
    input.locale === 'uk' ? 'Заборонені відповіді' : 'Forbidden answers';
  const prompt = [
    `${input.template.name}: ${input.template.description}`,
    input.template.goodExamples
      ? `${examples} (${input.locale === 'uk' ? 'вдалі' : 'good'}): ${input.template.goodExamples}`
      : '',
    input.template.badExamples
      ? `${examples} (${input.locale === 'uk' ? 'невдалі' : 'bad'}): ${input.template.badExamples}`
      : '',
    `${context}: ${input.context}`,
    input.excludedAnswers.length
      ? `${excludedAnswers} (${input.locale === 'uk' ? 'кожен рядок позначає вже використану сутність; обери іншу сутність, а не її синонім, псевдонім, переклад, уточнення чи описову назву; урізноманітнюй людей, місця, події, предмети, твори, поняття та форму відповідей' : 'each string denotes an already used entity; choose a different entity, not its synonym, alias, translation, qualification, or descriptive name; vary people, places, events, objects, works, concepts, and answer forms'}): ${JSON.stringify(input.excludedAnswers)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    system:
      input.locale === 'uk'
        ? 'Створи питання для гри «Що? Де? Коли?» за обраним шаблоном. Коментар до відповіді є обов’язковим: коротко поясни правильну відповідь. Заповни всі поля формату відповіді; для інших необов’язкових полів без значення поверни null, а для списків — порожній список.'
        : 'Create a What? Where? When? game question from the selected template. The answer comment is required: briefly explain the correct answer. Fill every response field; use null for other absent optional fields and empty arrays for absent lists.',
    prompt,
  };
}
