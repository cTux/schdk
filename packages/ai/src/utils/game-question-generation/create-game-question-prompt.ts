import { type GameQuestionGenerationRequest } from '../../types/game-question-generation/game-question-generation-request.js';

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
    `${difficulty}: ${input.difficultyPrompt}`,
    `${recognizability}: ${input.recognizabilityPrompt}`,
    `${context}: ${input.context}`,
    input.excludedAnswers.length
      ? `${excludedAnswers} (${input.locale === 'uk' ? 'кожен рядок позначає вже використану сутність; обери іншу сутність, а не її синонім, псевдонім, переклад, уточнення чи описову назву; урізноманітнюй людей, місця, події, предмети, твори, поняття та форму відповідей' : 'each string denotes an already used entity; choose a different entity, not its synonym, alias, translation, qualification, or descriptive name; vary people, places, events, objects, works, concepts, and answer forms'}): ${JSON.stringify(input.excludedAnswers)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    system:
      (input.locale === 'uk'
        ? 'Створи питання для гри «Що? Де? Коли?» за обраним шаблоном. Формулюй питання природно, так, ніби його написала людина, а не ШІ. Коментар до відповіді є обов’язковим: поясни лише, чому саме ця відповідь правильна; одразу наведи факти без шаблонних вступів на кшталт «Обидві підказки незалежно вказують на»; не пояснюй, чому питання сформульовано або згенеровано саме так. hostNotes призначено лише для вказівок ведучому під час читання питання: вимови, тексту, який не треба читати, озвучення лапок, пауз або сигналів; не додавай туди перевірку відповіді, оцінку складності чи аналіз якості. Якщо контекст містить поточне питання та зауваження автора, перероби питання з урахуванням зауваження і поверни comment: null після його усунення. Якщо шаблон або контекст вимагає текстову роздатку, додай її в handout; інакше поверни handout: null. Якщо потрібне зображення, поверни детальний самодостатній опис для його створення в imagePrompt; інакше поверни imagePrompt: null. Не вигадуй data URL. Заповни всі поля формату відповіді; для інших необов’язкових полів без значення поверни null, а для списків — порожній список.'
        : 'Create a What? Where? When? game question from the selected template. Phrase the question naturally, as if a human wrote it rather than AI. The answer comment is required: explain only why this answer is correct; state the supporting facts directly without stock introductions such as “Both clues independently point to”; do not explain why the question was phrased or generated this way. hostNotes is only for delivery instructions shown to the host while reading the question, such as pronunciation, text to omit, audible quotation marks, pauses, or cues; never put answer-checking guidance, difficulty estimates, or quality analysis there. If the context contains a current question and an author remark, revise the question to address the remark and return comment: null once resolved. If the template or context requires a text handout, include it in handout; otherwise return handout: null. If an image is required, return a detailed self-contained generation description in imagePrompt; otherwise return imagePrompt: null. Do not invent data URLs. Fill every response field; use null for other absent optional fields and empty arrays for absent lists.') +
      (input.locale === 'uk'
        ? ' Опис шаблону та приклади є лише внутрішніми вказівками для побудови. Не копіюй у questionParts або answerComment назви прийомів, шляхів, етапів чи службові заголовки на кшталт «Фактологічний шлях» або «Асоціативний шлях». У цих полях має бути лише готовий природний текст для гравців.'
        : ' The template description and examples are private construction guidance only. Never copy technique names, paths, stages, or internal headings such as “Factual path” or “Associative path” into questionParts or answerComment. Those fields must contain only natural reader-facing prose.'),
    prompt,
  };
}
