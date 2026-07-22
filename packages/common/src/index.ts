export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;

export interface Handout {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface GameQuestion {
  question: string;
  answer: string;
  alternativeAnswers: string[];
  handout?: Handout;
  comment?: string;
  hostNotes?: string;
}

export interface GamePackage {
  format: 'schdk-game-package';
  version: 1;
  title: string;
  questions: GameQuestion[];
}

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 1,
    title: '',
    questions: Array.from({ length: QUESTION_COUNT }, () => ({
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
    if (question.comment?.trim())
      errors.push(`Питання ${number}: є невирішений коментар.`);
  });

  return errors;
}

export function serializeGamePackage(gamePackage: GamePackage): string {
  return JSON.stringify(
    {
      ...gamePackage,
      title: gamePackage.title.trim(),
      questions: gamePackage.questions.map((question) => ({
        question: question.question.trim(),
        answer: question.answer.trim(),
        alternativeAnswers: question.alternativeAnswers
          .map((answer) => answer.trim())
          .filter(Boolean),
        ...(question.handout ? { handout: question.handout } : {}),
        ...(question.comment?.trim()
          ? { comment: question.comment.trim() }
          : {}),
        ...(question.hostNotes?.trim()
          ? { hostNotes: question.hostNotes.trim() }
          : {}),
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

  const questions = value.questions.map((question): GameQuestion => {
    if (
      !question ||
      typeof question !== 'object' ||
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
    const comment = 'comment' in question ? question.comment : undefined;
    const hostNotes = 'hostNotes' in question ? question.hostNotes : undefined;
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
    if (
      (comment !== undefined && typeof comment !== 'string') ||
      (hostNotes !== undefined && typeof hostNotes !== 'string')
    ) {
      throw new Error('Invalid game package');
    }

    return {
      question: question.question,
      answer: question.answer,
      alternativeAnswers: question.alternativeAnswers,
      ...(handout ? { handout } : {}),
      ...(comment !== undefined ? { comment } : {}),
      ...(hostNotes !== undefined ? { hostNotes } : {}),
    };
  });

  return {
    format: value.format,
    version: value.version,
    title: value.title,
    questions,
  };
}
