import {
  AI_QUESTION_DIFFICULTIES,
  type AIQuestion,
  type AIQuestionDifficulty,
} from '@schdk/common';

const difficultyInstructions: Record<
  AIQuestionDifficulty,
  Record<'uk' | 'en', string>
> = {
  'very-easy': {
    uk: 'Дуже легке: 0–1 очевидний бар’єр розв’язання; загальновідомі факти й майже пряме прочитання.',
    en: 'Very easy: 0–1 obvious solving barrier; common knowledge and an almost direct reading.',
  },
  easy: {
    uk: 'Легке: 1–2 прості бар’єри розв’язання; знайомий факт або очевидна асоціація та сильна перевірочна підказка.',
    en: 'Easy: 1–2 simple solving barriers; a familiar fact or obvious association and a strong confirming clue.',
  },
  medium: {
    uk: 'Середнє: 2–3 помірні бар’єри розв’язання; один небуквальний перехід або доступний, але не миттєво згадуваний факт.',
    en: 'Medium: 2–3 moderate solving barriers; one non-literal step or an accessible fact that is not recalled immediately.',
  },
  hard: {
    uk: 'Важке: 3–4 взаємозалежні бар’єри розв’язання; складний перехід між темами або спеціалізований, але справедливо підказаний факт.',
    en: 'Hard: 3–4 interdependent solving barriers; a difficult cross-topic step or a specialized but fairly clued fact.',
  },
  'very-hard': {
    uk: 'Дуже важке: щонайменше 4 бар’єри або 2 складні переходи; усі потрібні опори мають бути присутні, а відповідь — однозначна.',
    en: 'Very hard: at least 4 barriers or 2 difficult transitions; every required clue must be present and the answer unambiguous.',
  },
};

export interface GameQuestionGenerationRequest {
  provider: string;
  model: string;
  locale: 'uk' | 'en';
  template: AIQuestion;
  context: string;
  difficulty: AIQuestionDifficulty;
  excludedAnswers: string[];
  existingQuestions: ExistingQuestionReference[];
}

export interface ExistingQuestionReference {
  question: string;
  answers: string[];
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
    !AI_QUESTION_DIFFICULTIES.includes(input.difficulty) ||
    !Array.isArray(input.excludedAnswers) ||
    input.excludedAnswers.length > 1_000 ||
    input.excludedAnswers.some(
      (answer) => typeof answer !== 'string' || answer.length > 1_000,
    ) ||
    input.excludedAnswers.reduce(
      (length, answer) => length + answer.length,
      0,
    ) > 20_000 ||
    !Array.isArray(input.existingQuestions) ||
    input.existingQuestions.length > 10_000 ||
    input.existingQuestions.some(
      (question) =>
        !question ||
        typeof question.question !== 'string' ||
        question.question.length > 20_000 ||
        !Array.isArray(question.answers) ||
        question.answers.length > 100 ||
        question.answers.some(
          (answer) => typeof answer !== 'string' || answer.length > 1_000,
        ),
    ) ||
    input.existingQuestions.reduce(
      (total, question) =>
        total +
        question.question.length +
        question.answers.reduce((length, answer) => length + answer.length, 0),
      0,
    ) > 5_000_000 ||
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
  const difficulty = input.locale === 'uk' ? 'Складність' : 'Difficulty';
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
    `${difficulty}: ${difficultyInstructions[input.difficulty][input.locale]}`,
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
        ? 'Створи питання для гри «Що? Де? Коли?» за обраним шаблоном. Формулюй питання природно, так, ніби його написала людина, а не ШІ. Коментар до відповіді є обов’язковим: поясни лише, чому саме ця відповідь правильна; не пояснюй, чому питання сформульовано або згенеровано саме так. hostNotes призначено лише для вказівок ведучому під час читання питання: вимови, тексту, який не треба читати, озвучення лапок, пауз або сигналів; не додавай туди перевірку відповіді, оцінку складності чи аналіз якості. Якщо контекст містить поточне питання та зауваження автора, перероби питання з урахуванням зауваження і поверни comment: null після його усунення. Якщо шаблон або контекст вимагає роздатковий матеріал, додай його як текст; інакше поверни handout: null. Не вигадуй зображення або data URL. Заповни всі поля формату відповіді; для інших необов’язкових полів без значення поверни null, а для списків — порожній список.'
        : 'Create a What? Where? When? game question from the selected template. Phrase the question naturally, as if a human wrote it rather than AI. The answer comment is required: explain only why this answer is correct; do not explain why the question was phrased or generated this way. hostNotes is only for delivery instructions shown to the host while reading the question, such as pronunciation, text to omit, audible quotation marks, pauses, or cues; never put answer-checking guidance, difficulty estimates, or quality analysis there. If the context contains a current question and an author remark, revise the question to address the remark and return comment: null once resolved. If the template or context requires a handout, include it as text; otherwise return handout: null. Do not invent images or data URLs. Fill every response field; use null for other absent optional fields and empty arrays for absent lists.',
    prompt,
  };
}
