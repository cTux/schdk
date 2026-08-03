import type { GamePackage, GameQuestion } from '@schdk/common';
import type { DrivePackageStorage } from '@schdk/google-drive/game-packages';
import type { EditorViewProps } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { EditorTextOptions } from '@schdk/ui/options';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { addQuestionHandout } from './add-question-handout';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';
import {
  copyQuestionToClipboard,
  readQuestionFromClipboard,
} from './question-clipboard';
import {
  replaceGamePackageQuestion,
  updateGamePackageQuestion,
} from './question-package';
import { selectDatabaseQuestion as loadDatabaseQuestion } from './select-database-question';
import { correctAnswer, correctSentence } from './text-correction';

interface QuestionActionsOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  currentPackage: RefObject<GamePackage>;
  gamePackage: GamePackage;
  locale: AppLocale;
  selectedIndex: number;
  textOptions: EditorTextOptions;
  onDriveFailure?(): void;
  changeGamePackage: Dispatch<SetStateAction<GamePackage>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useQuestionActions({
  confirm,
  copy,
  currentPackage,
  drive,
  gamePackage,
  locale,
  selectedIndex,
  textOptions,
  onDriveFailure,
  changeGamePackage,
  setMessage,
  setSelectedIndex,
}: QuestionActionsOptions) {
  function updateQuestion(change: Partial<GameQuestion>) {
    changeGamePackage((current) =>
      updateGamePackageQuestion(current, selectedIndex, change),
    );
    setMessage('');
  }

  function replaceQuestion(index: number, question: GameQuestion) {
    changeGamePackage((current) =>
      replaceGamePackageQuestion(current, index, question),
    );
    setMessage('');
  }

  const correct = (
    enabled: boolean,
    value: string,
    field: 'answer' | 'answerComment',
    correction: (value: string) => string,
  ) => {
    if (!enabled) return;
    const corrected = correction(value);
    if (corrected !== value) updateQuestion({ [field]: corrected });
  };

  function correctListedAnswer(
    field: 'alternativeAnswers' | 'wrongAnswers',
    index: number,
  ) {
    if (!textOptions.correctAnswers) return;
    const answers = gamePackage.questions[selectedIndex]![field];
    const corrected = correctAnswer(answers[index] ?? '');
    if (corrected === answers[index]) return;
    updateQuestion({
      [field]: answers.map((answer, answerIndex) =>
        answerIndex === index ? corrected : answer,
      ),
    });
  }

  function correctQuestionText(index: number) {
    if (!textOptions.correctQuestionText) return;
    const parts = gamePackage.questions[selectedIndex]!.questionParts;
    const corrected = correctSentence(parts[index] ?? '');
    if (corrected === parts[index]) return;
    updateQuestion({
      questionParts: parts.map((part, partIndex) =>
        partIndex === index ? corrected : part,
      ),
    });
  }

  async function copyQuestion() {
    await copyQuestionToClipboard(
      gamePackage.questions[selectedIndex]!,
      copy,
      locale,
      setMessage,
    );
  }

  async function pasteQuestion() {
    const question = await readQuestionFromClipboard(
      selectedIndex,
      confirm,
      copy,
      locale,
      setMessage,
    );
    if (question) replaceQuestion(selectedIndex, question);
  }

  async function selectDatabaseQuestion(
    row: EditorViewProps['document']['questionDatabaseRows'][number],
  ) {
    return loadDatabaseQuestion({
      confirm,
      copy,
      current: gamePackage.questions[selectedIndex]!,
      drive,
      row,
      selectedIndex,
      onDriveFailure,
      replaceQuestion: (question) => replaceQuestion(selectedIndex, question),
      setMessage,
    });
  }

  function swapQuestionPositions(sourceIndex: number, targetIndex: number) {
    changeGamePackage((current) => ({
      ...current,
      questions: swapQuestions(current.questions, sourceIndex, targetIndex),
    }));
    setSelectedIndex((current) =>
      getSelectedIndexAfterSwap(current, sourceIndex, targetIndex),
    );
    setMessage('');
  }

  async function addHandout(file: File) {
    await addQuestionHandout({
      copy,
      currentPackage,
      file,
      gamePackage,
      selectedIndex,
      replaceQuestion,
      setMessage,
    });
  }

  const question = gamePackage.questions[selectedIndex]!;
  return {
    addHandout,
    copyQuestion,
    correctAlternativeAnswer: (index: number) =>
      correctListedAnswer('alternativeAnswers', index),
    correctAnswerComment: () =>
      correct(
        textOptions.correctAnswerComment,
        question.answerComment ?? '',
        'answerComment',
        correctSentence,
      ),
    correctMainAnswer: () =>
      correct(
        textOptions.correctAnswers,
        question.answer,
        'answer',
        correctAnswer,
      ),
    correctQuestionText,
    correctWrongAnswer: (index: number) =>
      correctListedAnswer('wrongAnswers', index),
    pasteQuestion,
    replaceQuestion,
    selectDatabaseQuestion,
    swapQuestionPositions,
    updateQuestion,
  };
}
