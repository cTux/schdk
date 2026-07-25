import type { GamePackage, GameQuestion } from '@schdk/common';
import { useEffect } from 'react';
import type {} from './electron';
import type { GamePosition } from './game-flow';

interface PresenterNotesState {
  active: boolean;
  finished: boolean;
  gamePackage: GamePackage | null;
  position: GamePosition;
  question: GameQuestion | null;
}

export function usePresenterNotes({
  active,
  finished,
  gamePackage,
  position,
  question,
}: PresenterNotesState) {
  useEffect(() => {
    if (!window.desktop) return;
    if (
      !active ||
      finished ||
      !gamePackage ||
      !question ||
      position.stage === 'musicBreak'
    ) {
      window.desktop.setPresenterNotes(null);
      return;
    }
    window.desktop.setPresenterNotes({
      questionNumber: position.questionIndex + 1,
      questionCount: gamePackage.questions.length,
      notes: question.hostNotes?.trim() ?? '',
    });
  }, [
    active,
    finished,
    gamePackage,
    position.questionIndex,
    position.stage,
    question,
  ]);

  useEffect(
    () => () => {
      window.desktop?.setPresenterNotes(null);
    },
    [],
  );
}
