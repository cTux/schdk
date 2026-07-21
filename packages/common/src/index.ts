export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;

export type QuestionKind = 'general' | 'football' | 'music';

export interface Handout {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface GameQuestion {
  kind: QuestionKind;
  question: string;
  answer: string;
  alternativeAnswers: string[];
  handout?: Handout;
}

export interface GamePackage {
  format: 'schdk-game-package';
  version: 1;
  title: string;
  questions: GameQuestion[];
}

export function requiredQuestionKind(index: number): QuestionKind {
  if ([11, 23, 35].includes(index)) return 'music';
  if (index === 10) return 'football';
  return 'general';
}

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 1,
    title: '',
    questions: Array.from({ length: QUESTION_COUNT }, (_, index) => ({
      kind: requiredQuestionKind(index),
      question: '',
      answer: '',
      alternativeAnswers: [],
    })),
  };
}

export function validateGamePackage(gamePackage: GamePackage): string[] {
  const errors: string[] = [];

  if (!gamePackage.title.trim()) errors.push('Вкажіть назву пакета.');
  if (gamePackage.questions.length !== QUESTION_COUNT) {
    errors.push(`Пакет має містити рівно ${QUESTION_COUNT} питань.`);
    return errors;
  }

  gamePackage.questions.forEach((question, index) => {
    const number = index + 1;
    if (!question.question.trim())
      errors.push(`Питання ${number}: немає тексту.`);
    if (!question.answer.trim())
      errors.push(`Питання ${number}: немає відповіді.`);
    if (question.kind !== requiredQuestionKind(index)) {
      errors.push(`Питання ${number}: неправильний тип.`);
    }
  });

  return errors;
}

export function serializeGamePackage(gamePackage: GamePackage): string {
  return JSON.stringify(
    {
      ...gamePackage,
      title: gamePackage.title.trim(),
      questions: gamePackage.questions.map((question) => ({
        ...question,
        question: question.question.trim(),
        answer: question.answer.trim(),
        alternativeAnswers: question.alternativeAnswers
          .map((answer) => answer.trim())
          .filter(Boolean),
      })),
    },
    null,
    2,
  );
}

export function parseGamePackage(content: string): GamePackage {
  const value: unknown = JSON.parse(content);
  if (
    !value ||
    typeof value !== 'object' ||
    !('format' in value) ||
    value.format !== 'schdk-game-package' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('title' in value) ||
    typeof value.title !== 'string' ||
    !('questions' in value) ||
    !Array.isArray(value.questions) ||
    value.questions.length !== QUESTION_COUNT
  ) {
    throw new Error('Invalid game package');
  }

  const questions = value.questions.map((question, index): GameQuestion => {
    if (
      !question ||
      typeof question !== 'object' ||
      !('kind' in question) ||
      question.kind !== requiredQuestionKind(index) ||
      !('question' in question) ||
      typeof question.question !== 'string' ||
      !('answer' in question) ||
      typeof question.answer !== 'string' ||
      !('alternativeAnswers' in question) ||
      !Array.isArray(question.alternativeAnswers) ||
      !question.alternativeAnswers.every(
        (answer: unknown) => typeof answer === 'string',
      )
    ) {
      throw new Error('Invalid game package');
    }

    const handout = 'handout' in question ? question.handout : undefined;
    if (
      handout !== undefined &&
      (!handout ||
        typeof handout !== 'object' ||
        !('name' in handout) ||
        typeof handout.name !== 'string' ||
        !('mimeType' in handout) ||
        typeof handout.mimeType !== 'string' ||
        !('dataUrl' in handout) ||
        typeof handout.dataUrl !== 'string')
    ) {
      throw new Error('Invalid game package');
    }

    return {
      kind: question.kind,
      question: question.question,
      answer: question.answer,
      alternativeAnswers: question.alternativeAnswers,
      ...(handout ? { handout } : {}),
    };
  });

  return {
    format: value.format,
    version: value.version,
    title: value.title,
    questions,
  };
}
