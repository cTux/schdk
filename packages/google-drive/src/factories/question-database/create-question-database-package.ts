import type { GamePackage } from '@schdk/common/game-packages';
import type { DriveGamePackageFile } from '../../services/game-packages/game-packages.js';
import { type QuestionDatabasePackage } from '../../types/question-database/question-database-package.js';

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
