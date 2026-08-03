import { serializeGamePackage, type GamePackage } from '@schdk/common';
import type { RefObject } from 'react';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { replaceGamePackageQuestion } from './question-package';
import { readImageHandout } from './read-image-handout';

interface QuestionHandoutOptions {
  copy: LocalizationCopy;
  currentPackage: RefObject<GamePackage>;
  file: File;
  gamePackage: GamePackage;
  selectedIndex: number;
  replaceQuestion(
    index: number,
    question: GamePackage['questions'][number],
  ): void;
  setMessage(message: string): void;
}

export async function addQuestionHandout({
  copy,
  currentPackage,
  file,
  gamePackage,
  selectedIndex,
  replaceQuestion,
  setMessage,
}: QuestionHandoutOptions) {
  try {
    const handout = await readImageHandout(file);
    if (currentPackage.current !== gamePackage) return;
    const question = {
      ...gamePackage.questions[selectedIndex]!,
      handout,
    };
    serializeGamePackage(
      replaceGamePackageQuestion(gamePackage, selectedIndex, question),
    );
    replaceQuestion(selectedIndex, question);
  } catch {
    setMessage(copy.visualEditor.chooseImage);
  }
}
