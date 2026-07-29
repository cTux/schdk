import { isDriveFileId } from './settings.js';
import { type QuestionDatabaseQuestion } from './question-database-question.js';
import { type QuestionDatabasePackage } from './question-database-package.js';
import { type QuestionDatabaseDocument } from './question-database-document.js';
import { type QuestionDatabaseEntry } from './question-database-entry.js';
import { type DriveQuestionDatabaseStorage } from './drive-question-database-storage.js';
import { createQuestionDatabasePackage } from './create-question-database-package.js';
import { flattenQuestionDatabase } from './flatten-question-database.js';

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

function parseQuestionDatabaseDocument(
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

export {
  type QuestionDatabaseQuestion,
  type QuestionDatabasePackage,
  type QuestionDatabaseDocument,
  type QuestionDatabaseEntry,
  type DriveQuestionDatabaseStorage,
  parseQuestionDatabaseDocument,
  createQuestionDatabasePackage,
  flattenQuestionDatabase,
};
