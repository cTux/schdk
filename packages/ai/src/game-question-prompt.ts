import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '@schdk/common';

const difficultyInstructions: Record<
  AIQuestionDifficulty,
  Record<'uk' | 'en', string>
> = {
  'very-easy': {
    uk: 'Дуже легке: 0–1 очевидний бар’єр розв’язання та майже пряме прочитання.',
    en: 'Very easy: 0–1 obvious solving barrier and an almost direct reading.',
  },
  easy: {
    uk: 'Легке: 1–2 прості бар’єри розв’язання, очевидна асоціація та сильна перевірочна підказка.',
    en: 'Easy: 1–2 simple solving barriers, an obvious association, and a strong confirming clue.',
  },
  medium: {
    uk: 'Середнє: 2–3 помірні бар’єри розв’язання або один небуквальний перехід.',
    en: 'Medium: 2–3 moderate solving barriers or one non-literal step.',
  },
  hard: {
    uk: 'Важке: 3–4 взаємозалежні бар’єри розв’язання або складний перехід між темами.',
    en: 'Hard: 3–4 interdependent solving barriers or a difficult cross-topic step.',
  },
  'very-hard': {
    uk: 'Дуже важке: щонайменше 4 бар’єри або 2 складні переходи; усі потрібні опори мають бути присутні, а відповідь — однозначна.',
    en: 'Very hard: at least 4 barriers or 2 difficult transitions; every required clue must be present and the answer unambiguous.',
  },
};

const recognizabilityInstructions: Record<
  AIQuestionRecognizability,
  Record<'uk' | 'en', string>
> = {
  'very-easy': {
    uk: 'Дуже легка: обери загальновідому сутність, яку впізнає майже вся цільова аудиторія.',
    en: 'Very easy: choose a universally known entity recognized by almost the entire target audience.',
  },
  easy: {
    uk: 'Легка: обери широко відому сутність, знайому більшості аудиторії без спеціалізованих знань.',
    en: 'Easy: choose a widely known entity familiar to most of the audience without specialized knowledge.',
  },
  medium: {
    uk: 'Середня: обери помірно відому сутність, знайому значній частині аудиторії; підказки мають дозволяти вивести відповідь без миттєвого впізнавання.',
    en: 'Medium: choose a moderately known entity familiar to a significant part of the audience; the clues must allow deduction without immediate recognition.',
  },
  hard: {
    uk: 'Важка: обери менш відому, але значущу сутність, переважно знайому людям, які цікавляться відповідною сферою; дай достатньо опор для інших гравців.',
    en: 'Hard: choose a less widely known but meaningful entity, mainly familiar to people interested in its field; provide enough support for other players.',
  },
  'very-hard': {
    uk: 'Дуже важка: обери нішеву або спеціалізовану, але культурно чи тематично значущу сутність, а не випадковий маловідомий факт; усі потрібні для виведення опори мають бути в питанні.',
    en: 'Very hard: choose a niche or specialized but culturally or thematically meaningful entity, not an arbitrary obscure fact; include every clue required to deduce it.',
  },
};

export interface GameQuestionGenerationRequest {
  provider: string;
  model: string;
  locale: 'uk' | 'en';
  template: AIQuestion;
  context: string;
  difficulty: AIQuestionDifficulty;
  recognizability: AIQuestionRecognizability;
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
    !AI_QUESTION_RECOGNIZABILITIES.includes(input.recognizability) ||
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
  const recognizability =
    input.locale === 'uk' ? 'Впізнаваність' : 'Recognizability';
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
    `${recognizability}: ${recognizabilityInstructions[input.recognizability][input.locale]}`,
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
