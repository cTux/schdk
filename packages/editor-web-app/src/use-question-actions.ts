import {
  parseGameQuestion,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import {
  showQuestionActionToast,
  type EditorSaveStatus,
} from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { EditorTextOptions } from '@schdk/ui/options';
import type { Dispatch, SetStateAction } from 'react';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';
import { correctAnswer, correctSentence } from './text-correction';

interface QuestionActionsOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  gamePackage: GamePackage;
  locale: AppLocale;
  selectedIndex: number;
  textOptions: EditorTextOptions;
  setGamePackage: Dispatch<SetStateAction<GamePackage>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useQuestionActions({
  confirm,
  copy,
  gamePackage,
  locale,
  selectedIndex,
  textOptions,
  setGamePackage,
  setMessage,
  setSaveStatus,
  setSelectedIndex,
}: QuestionActionsOptions) {
  function updateQuestion(change: Partial<GameQuestion>) {
    setGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, index) =>
        index === selectedIndex ? { ...item, ...change } : item,
      ),
    }));
    setSaveStatus('pending');
    setMessage('');
  }

  function replaceQuestion(index: number, question: GameQuestion) {
    setGamePackage((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) =>
        itemIndex === index ? question : item,
      ),
    }));
    setSaveStatus('pending');
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
      showQuestionActionToast('copied', locale);
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
      setGamePackage((current) => ({
        ...current,
        questions: current.questions.map((item, index) =>
          index === selectedIndex ? question : item,
        ),
      }));
      setSaveStatus('pending');
      showQuestionActionToast('pasted', locale);
    } catch {
      setMessage(copy.editor.pasteFailed);
    }
  }

  function swapQuestionPositions(sourceIndex: number, targetIndex: number) {
    setGamePackage((current) => ({
      ...current,
      questions: swapQuestions(current.questions, sourceIndex, targetIndex),
    }));
    setSelectedIndex((current) =>
      getSelectedIndexAfterSwap(current, sourceIndex, targetIndex),
    );
    setSaveStatus('pending');
    setMessage('');
  }

  function addHandout(file: File) {
    if (!file.type.startsWith('image/')) {
      setMessage(copy.visualEditor.chooseImage);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (
        typeof reader.result !== 'string' ||
        !reader.result.startsWith(`data:${file.type};base64,`)
      ) {
        setMessage(copy.visualEditor.chooseImage);
        return;
      }
      updateQuestion({
        handout: {
          kind: 'image',
          name: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
        },
      });
    });
    reader.addEventListener('error', () =>
      setMessage(copy.visualEditor.chooseImage),
    );
    reader.readAsDataURL(file);
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
    swapQuestionPositions,
    updateQuestion,
  };
}
