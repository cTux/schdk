import {
  parseGamePackage,
  parseGameQuestion,
  serializeGamePackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import type { DrivePackageStorage } from '@schdk/google-drive/game-packages';
import { showEditorToast, type EditorViewProps } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { EditorTextOptions } from '@schdk/ui/options';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';
import { readImageHandout } from './read-image-handout';
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
    changeGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, index) =>
        index === selectedIndex ? { ...item, ...change } : item,
      ),
    }));
    setMessage('');
  }

  function replaceQuestion(index: number, question: GameQuestion) {
    changeGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) =>
        itemIndex === index ? question : item,
      ),
    }));
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
    setMessage('');
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(gamePackage.questions[selectedIndex], null, 2),
      );
      showEditorToast('copied', locale);
    } catch {
      setMessage(copy.editor.copyFailed);
    }
  }

  async function pasteQuestion() {
    if (!(await confirm(copy.editor.confirmPaste(selectedIndex + 1)))) return;
    setMessage('');
    try {
      const question = parseGameQuestion(
        JSON.parse(await navigator.clipboard.readText()),
      );
      changeGamePackage((current) => ({
        ...current,
        questions: current.questions.map((item, index) =>
          index === selectedIndex ? question : item,
        ),
      }));
      showEditorToast('pasted', locale);
    } catch {
      setMessage(copy.editor.pasteFailed);
    }
  }

  async function selectDatabaseQuestion(
    row: EditorViewProps['document']['questionDatabaseRows'][number],
  ) {
    const current = gamePackage.questions[selectedIndex]!;
    const empty =
      current.questionParts.every((part) => !part.trim()) &&
      !current.answer.trim() &&
      current.alternativeAnswers.every((answer) => !answer.trim()) &&
      current.wrongAnswers.every((answer) => !answer.trim()) &&
      !current.answerComment?.trim() &&
      !current.comment?.trim() &&
      !current.hostNotes?.trim() &&
      !current.handout;
    if (
      !empty &&
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
      replaceQuestion(selectedIndex, source);
      return true;
    } catch {
      onDriveFailure?.();
      setMessage(copy.questionDatabase.loadQuestionFailed);
      return false;
    }
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
    const packageAtStart = gamePackage;
    const indexAtStart = selectedIndex;
    try {
      const handout = await readImageHandout(file);
      if (currentPackage.current !== packageAtStart) return;
      const question = {
        ...packageAtStart.questions[indexAtStart]!,
        handout,
      };
      serializeGamePackage({
        ...packageAtStart,
        questions: packageAtStart.questions.map((item, index) =>
          index === indexAtStart ? question : item,
        ),
      });
      replaceQuestion(indexAtStart, question);
    } catch {
      setMessage(copy.visualEditor.chooseImage);
    }
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
