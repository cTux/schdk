import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import {
  createEmptyGameQuestion,
  parseGameQuestion,
  serializeGameQuestion,
  type GameQuestion,
} from './game-question';

export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;
const PACKAGE_ENTRY = 'game.json';

export {
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
  parseGameQuestion,
} from './game-question';
export type {
  GameQuestion,
  GameQuestionType,
  Handout,
  ImageHandout,
  TextHandout,
} from './game-question';

export interface GamePackage {
  format: 'schdk-game-package';
  version: 2;
  title: string;
  questions: GameQuestion[];
}

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 2,
    title: 'Без назви',
    questions: Array.from({ length: QUESTION_COUNT }, createEmptyGameQuestion),
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
    question.questionParts.forEach((part, partIndex) => {
      if (!part.trim()) {
        const suffix =
          question.questionParts.length === 1
            ? ''
            : `, частина ${partIndex + 1}`;
        errors.push(`Питання ${number}${suffix}: немає тексту.`);
      }
    });
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
      questions: gamePackage.questions.map(serializeGameQuestion),
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
    (value.version !== 1 && value.version !== 2) ||
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
    version: 2,
    title: value.title,
    questions,
  };
}
