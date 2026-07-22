import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;
const PACKAGE_ENTRY = 'game.json';

export interface Handout {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface GameQuestion {
  question: string;
  answer: string;
  answerComment?: string;
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

function isHandout(value: unknown): value is Handout {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'mimeType' in value &&
    typeof value.mimeType === 'string' &&
    'dataUrl' in value &&
    typeof value.dataUrl === 'string',
  );
}

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 1,
    title: 'Без назви',
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

function serializeGamePackageJson(gamePackage: GamePackage): string {
  return JSON.stringify(
    {
      ...gamePackage,
      title: gamePackage.title.trim(),
      questions: gamePackage.questions.map((question) => ({
        question: question.question.trim(),
        answer: question.answer.trim(),
        ...(question.answerComment?.trim()
          ? { answerComment: question.answerComment.trim() }
          : {}),
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

export function serializeGamePackage(gamePackage: GamePackage): Uint8Array {
  return zipSync(
    { [PACKAGE_ENTRY]: strToU8(serializeGamePackageJson(gamePackage)) },
    { level: 9 },
  );
}

function readGamePackageJson(content: string | Uint8Array): string {
  if (typeof content === 'string') return content;
  if (content[0] !== 0x50 || content[1] !== 0x4b) return strFromU8(content);

  const gamePackage = unzipSync(content)[PACKAGE_ENTRY];
  if (!gamePackage) throw new Error('Invalid game package');
  return strFromU8(gamePackage);
}

export function parseGamePackage(content: string | Uint8Array): GamePackage {
  const value: unknown = JSON.parse(readGamePackageJson(content));
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

  let questions: GameQuestion[];
  try {
    questions = value.questions.map(parseGameQuestion);
  } catch {
    throw new Error('Invalid game package');
  }

  return {
    format: value.format,
    version: value.version,
    title: value.title,
    questions,
  };
}

export function parseGameQuestion(value: unknown): GameQuestion {
  if (
    !value ||
    typeof value !== 'object' ||
    !('question' in value) ||
    typeof value.question !== 'string' ||
    !('answer' in value) ||
    typeof value.answer !== 'string' ||
    !('alternativeAnswers' in value) ||
    !Array.isArray(value.alternativeAnswers) ||
    !value.alternativeAnswers.every(
      (answer: unknown) => typeof answer === 'string',
    )
  ) {
    throw new Error('Invalid game question');
  }

  const handout = 'handout' in value ? value.handout : undefined;
  const answerComment =
    'answerComment' in value ? value.answerComment : undefined;
  const comment = 'comment' in value ? value.comment : undefined;
  const hostNotes = 'hostNotes' in value ? value.hostNotes : undefined;
  if (handout !== undefined && !isHandout(handout)) {
    throw new Error('Invalid game question');
  }
  if (
    (answerComment !== undefined && typeof answerComment !== 'string') ||
    (comment !== undefined && typeof comment !== 'string') ||
    (hostNotes !== undefined && typeof hostNotes !== 'string')
  ) {
    throw new Error('Invalid game question');
  }

  return {
    question: value.question,
    answer: value.answer,
    ...(answerComment !== undefined ? { answerComment } : {}),
    alternativeAnswers: value.alternativeAnswers,
    ...(handout ? { handout } : {}),
    ...(comment !== undefined ? { comment } : {}),
    ...(hostNotes !== undefined ? { hostNotes } : {}),
  };
}
