import { type QuestionDatabaseDocument } from './question-database-document.js';
import { type QuestionDatabaseEntry } from './question-database-entry.js';

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
