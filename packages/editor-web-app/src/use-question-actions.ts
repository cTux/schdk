import {
  parseGameQuestion,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import type { EditorTextOptions } from '@schdk/ui/options';
import type { Dispatch, SetStateAction } from 'react';
import { getSelectedIndexAfterSwap, swapQuestions } from './question-order';
import { correctAnswer, correctSentence } from './text-correction';

interface QuestionActionsOptions {
  copy: LocalizationCopy;
  gamePackage: GamePackage;
  selectedIndex: number;
  textOptions: EditorTextOptions;
  setGamePackage: Dispatch<SetStateAction<GamePackage>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useQuestionActions({
  copy,
  gamePackage,
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

  const correct = (
    enabled: boolean,
    value: string,
    field: 'question' | 'answer' | 'answerComment',
    correction: (value: string) => string,
  ) => {
    if (!enabled) return;
    const corrected = correction(value);
    if (corrected !== value) updateQuestion({ [field]: corrected });
  };

  function correctAlternativeAnswer(index: number) {
    if (!textOptions.correctAnswers) return;
    const answers = gamePackage.questions[selectedIndex]!.alternativeAnswers;
    const corrected = correctAnswer(answers[index] ?? '');
    if (corrected === answers[index]) return;
    updateQuestion({
      alternativeAnswers: answers.map((answer, answerIndex) =>
        answerIndex === index ? corrected : answer,
      ),
    });
  }

  async function copyQuestion() {
    setMessage('');
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(gamePackage.questions[selectedIndex], null, 2),
      );
    } catch {
      setMessage(copy.editor.copyFailed);
    }
  }

  async function pasteQuestion() {
    if (!window.confirm(copy.editor.confirmPaste(selectedIndex + 1))) return;
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
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') return;
      updateQuestion({
        handout: {
          kind: 'image',
          name: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
        },
      });
    });
    reader.readAsDataURL(file);
  }

  const question = gamePackage.questions[selectedIndex]!;
  return {
    addHandout,
    copyQuestion,
    correctAlternativeAnswer,
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
    correctQuestionText: () =>
      correct(
        textOptions.correctQuestionText,
        question.question,
        'question',
        correctSentence,
      ),
    pasteQuestion,
    swapQuestionPositions,
    updateQuestion,
  };
}
