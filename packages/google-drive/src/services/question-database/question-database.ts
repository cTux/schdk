import { isDriveFileId } from '../settings/settings.js';
import { type QuestionDatabaseQuestion } from '../../types/question-database/question-database-question.js';
import { type QuestionDatabasePackage } from '../../types/question-database/question-database-package.js';
import { type QuestionDatabaseDocument } from '../../types/question-database/question-database-document.js';
import { type QuestionDatabaseEntry } from '../../types/question-database/question-database-entry.js';
import { type DriveQuestionDatabaseStorage } from '../../types/question-database/drive-question-database-storage.js';
import { createQuestionDatabasePackage } from '../../factories/question-database/create-question-database-package.js';
import { flattenQuestionDatabase } from '../../utils/question-database/flatten-question-database.js';

function parseQuestion(value: unknown): QuestionDatabaseQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const hasValidNumber =
    Number.isSafeInteger(item.number) &&
    Number(item.number) >= 1 &&
    Number(item.number) <= 36;
  const hasValidQuestion =
    typeof item.question === 'string' && item.question.length <= 20_000;
  const hasValidAnswer =
    typeof item.answer === 'string' && item.answer.length <= 1_000;
  const hasValidAlternativeAnswers =
    Array.isArray(item.alternativeAnswers) &&
    item.alternativeAnswers.length <= 100 &&
    item.alternativeAnswers.every(
      (answer) => typeof answer === 'string' && answer.length <= 1_000,
    );
  if (
    !hasValidNumber ||
    !hasValidQuestion ||
    !hasValidAnswer ||
    !hasValidAlternativeAnswers
  ) {
    return null;
  }
  return {
    number: Number(item.number),
    question: item.question as string,
    answer: item.answer as string,
    alternativeAnswers: item.alternativeAnswers as string[],
  };
}

function parsePackage(value: unknown): QuestionDatabasePackage | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const questions = Array.isArray(item.questions)
    ? item.questions.map(parseQuestion)
    : [];
  const hasValidIdentity =
    isDriveFileId(item.fileId) &&
    typeof item.modifiedTime === 'string' &&
    typeof item.title === 'string' &&
    item.title.length <= 1_000;
  const hasValidQuestions = questions.length <= 36 && questions.every(Boolean);
  if (!hasValidIdentity || !hasValidQuestions) {
    return null;
  }
  return {
    fileId: item.fileId as string,
    modifiedTime: item.modifiedTime as string,
    title: item.title as string,
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
  const hasExpectedSchema = document.schemaVersion === 1;
  const hasValidPackages = packages.length <= 10_000 && packages.every(Boolean);
  if (!hasExpectedSchema || !hasValidPackages) {
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
