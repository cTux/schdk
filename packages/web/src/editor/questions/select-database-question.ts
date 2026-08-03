import { parseGamePackage, type GameQuestion } from '@schdk/common';
import type { DrivePackageStorage } from '@schdk/google-drive/game-packages';
import type { EditorViewProps } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { isGameQuestionEmpty } from './question-package';

interface DatabaseQuestionOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  current: GameQuestion;
  drive?: DrivePackageStorage;
  row: EditorViewProps['document']['questionDatabaseRows'][number];
  selectedIndex: number;
  onDriveFailure?(): void;
  replaceQuestion(question: GameQuestion): void;
  setMessage(message: string): void;
}

export async function selectDatabaseQuestion({
  confirm,
  copy,
  current,
  drive,
  row,
  selectedIndex,
  onDriveFailure,
  replaceQuestion,
  setMessage,
}: DatabaseQuestionOptions) {
  if (
    !isGameQuestionEmpty(current) &&
    !(await confirm(
      copy.questionDatabase.confirmReplacement(selectedIndex + 1),
    ))
  ) {
    return false;
  }
  try {
    if (!drive) throw new Error('Google Drive is unavailable');
    const source = parseGamePackage(
      (await drive.loadGamePackage(row.fileId)).content,
    ).questions[row.number - 1];
    if (!source) throw new Error('Question is unavailable');
    replaceQuestion(source);
    return true;
  } catch {
    onDriveFailure?.();
    setMessage(copy.questionDatabase.loadQuestionFailed);
    return false;
  }
}
