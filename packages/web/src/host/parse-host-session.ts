import type { HostQuestionStage } from '@schdk/common/game-hosting';
import { type HostSession } from './host-session';
import { STAGES } from './stages';

export function parseHostSession(value: unknown): HostSession | null {
  if (!value || typeof value !== 'object') return null;
  const session = value as Record<string, unknown>;
  const position = session.position as Record<string, unknown> | undefined;
  const hasValidPackageId =
    typeof session.packageId === 'string' && Boolean(session.packageId);
  const hasValidGameState =
    typeof session.gameActive === 'boolean' &&
    typeof session.finished === 'boolean';
  const hasValidQuestionIndex =
    !!position &&
    Number.isSafeInteger(position.questionIndex) &&
    Number(position.questionIndex) >= 0;
  const hasValidQuestionPartIndex =
    !!position &&
    (position.questionPartIndex === undefined ||
      (Number.isSafeInteger(position.questionPartIndex) &&
        Number(position.questionPartIndex) >= 0));
  const hasValidStage =
    !!position && STAGES.includes(position.stage as HostQuestionStage);
  if (
    !hasValidPackageId ||
    !hasValidGameState ||
    !hasValidQuestionIndex ||
    !hasValidQuestionPartIndex ||
    !hasValidStage
  ) {
    return null;
  }
  return {
    packageId: session.packageId as string,
    gameActive: session.gameActive as boolean,
    finished: session.finished as boolean,
    position: {
      questionIndex: Number(position.questionIndex),
      questionPartIndex: Number.isSafeInteger(position.questionPartIndex)
        ? Number(position.questionPartIndex)
        : 0,
      stage: position.stage as HostQuestionStage,
    },
  };
}
