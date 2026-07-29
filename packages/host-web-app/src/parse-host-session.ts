import type { HostQuestionStage } from '@schdk/ui/host';
import { type HostSession } from './host-session';
import { STAGES } from './stages';

export function parseHostSession(value: unknown): HostSession | null {
  if (!value || typeof value !== 'object') return null;
  const session = value as Record<string, unknown>;
  const position = session.position as Record<string, unknown> | undefined;
  if (
    typeof session.packageId !== 'string' ||
    !session.packageId ||
    typeof session.gameActive !== 'boolean' ||
    typeof session.finished !== 'boolean' ||
    !position ||
    !Number.isSafeInteger(position.questionIndex) ||
    Number(position.questionIndex) < 0 ||
    (position.questionPartIndex !== undefined &&
      (!Number.isSafeInteger(position.questionPartIndex) ||
        Number(position.questionPartIndex) < 0)) ||
    !STAGES.includes(position.stage as HostQuestionStage)
  ) {
    return null;
  }
  return {
    packageId: session.packageId,
    gameActive: session.gameActive,
    finished: session.finished,
    position: {
      questionIndex: Number(position.questionIndex),
      questionPartIndex: Number.isSafeInteger(position.questionPartIndex)
        ? Number(position.questionPartIndex)
        : 0,
      stage: position.stage as HostQuestionStage,
    },
  };
}
