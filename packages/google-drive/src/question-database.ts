import type { GamePackage } from '@schdk/common';
import type { DriveGamePackageFile } from './game-packages.js';
import { isDriveFileId } from './settings.js';

export interface QuestionDatabaseQuestion {
  number: number;
  question: string;
  answer: string;
  alternativeAnswers: string[];
}

export interface QuestionDatabasePackage {
  fileId: string;
  modifiedTime: string;
  title: string;
  questions: QuestionDatabaseQuestion[];
}

export interface QuestionDatabaseDocument {
  schemaVersion: 1;
  packages: QuestionDatabasePackage[];
}

export interface QuestionDatabaseEntry extends QuestionDatabaseQuestion {
  fileId: string;
  packageTitles: string[];
}

export interface DriveQuestionDatabaseStorage {
  loadQuestionDatabase(): Promise<QuestionDatabaseDocument | null>;
  saveQuestionDatabase(value: QuestionDatabaseDocument): Promise<void>;
}

function parseQuestion(value: unknown): QuestionDatabaseQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(item.number) ||
    Number(item.number) < 1 ||
    Number(item.number) > 36 ||
    typeof item.question !== 'string' ||
    item.question.length > 20_000 ||
    typeof item.answer !== 'string' ||
    item.answer.length > 1_000 ||
    !Array.isArray(item.alternativeAnswers) ||
    item.alternativeAnswers.length > 100 ||
    !item.alternativeAnswers.every(
      (answer) => typeof answer === 'string' && answer.length <= 1_000,
    )
  ) {
    return null;
  }
  return {
    number: Number(item.number),
    question: item.question,
    answer: item.answer,
    alternativeAnswers: item.alternativeAnswers,
  };
}

function parsePackage(value: unknown): QuestionDatabasePackage | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const questions = Array.isArray(item.questions)
    ? item.questions.map(parseQuestion)
    : [];
  if (
    !isDriveFileId(item.fileId) ||
    typeof item.modifiedTime !== 'string' ||
    typeof item.title !== 'string' ||
    item.title.length > 1_000 ||
    questions.length > 36 ||
    questions.some((question) => !question)
  ) {
    return null;
  }
  return {
    fileId: item.fileId,
    modifiedTime: item.modifiedTime,
    title: item.title,
    questions: questions as QuestionDatabaseQuestion[],
  };
}

export function parseQuestionDatabaseDocument(
  value: unknown,
): QuestionDatabaseDocument | null {
  if (!value || typeof value !== 'object') return null;
  const document = value as Record<string, unknown>;
  const packages = Array.isArray(document.packages)
    ? document.packages.map(parsePackage)
    : [];
  if (
    document.schemaVersion !== 1 ||
    packages.some((item) => !item) ||
    packages.length > 10_000
  ) {
    return null;
  }
  return {
    schemaVersion: 1,
    packages: packages as QuestionDatabasePackage[],
  };
}

export function createQuestionDatabasePackage(
  file: DriveGamePackageFile,
  gamePackage: GamePackage,
): QuestionDatabasePackage {
  return {
    fileId: file.id,
    modifiedTime: file.modifiedTime,
    title:
      gamePackage.title || file.title || file.name.replace(/\.schdk$/iu, ''),
    questions: gamePackage.questions.flatMap((question, index) => {
      const text = question.questionParts.join('\n\n').trim();
      if (!text || !question.answer.trim()) return [];
      return [
        {
          number: index + 1,
          question: text,
          answer: question.answer,
          alternativeAnswers: question.alternativeAnswers,
        },
      ];
    }),
  };
}

export function flattenQuestionDatabase(
  value: QuestionDatabaseDocument,
): QuestionDatabaseEntry[] {
  const entries = new Map<string, QuestionDatabaseEntry>();
  value.packages.forEach((item) => {
    item.questions.forEach((question) => {
      const key = JSON.stringify([
        question.question.trim(),
        question.answer.trim(),
        question.alternativeAnswers.map((answer) => answer.trim()),
      ]);
      const existing = entries.get(key);
      if (existing) {
        if (!existing.packageTitles.includes(item.title)) {
          existing.packageTitles.push(item.title);
        }
        return;
      }
      entries.set(key, {
        ...question,
        fileId: item.fileId,
        packageTitles: [item.title],
      });
    });
  });
  return [...entries.values()];
}
