import type { HostQuestionStage } from '@schdk/common/game-hosting';
import type { GamePosition } from './game-flow';

const SESSION_KEY_PREFIX = 'schdk.host-session:';
const HOST_PARAMETERS = {
  package: 'hostPackage',
  active: 'hostActive',
  finished: 'hostFinished',
  question: 'hostQuestion',
  questionPart: 'hostQuestionPart',
  stage: 'hostStage',
} as const;
const HOST_STAGES: HostQuestionStage[] = [
  'tour',
  'intro',
  'handout',
  'question',
  'timer',
  'timerReset',
  'answerComment',
  'answer',
  'musicBreak',
];

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

interface HostSession {
  packageId: string;
  gameActive: boolean;
  finished: boolean;
  position: GamePosition;
}

function parseHostSession(value: unknown): HostSession | null {
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
    !!position && HOST_STAGES.includes(position.stage as HostQuestionStage);
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

function loadHostSession(
  storage: SessionStorage,
  scope: string,
): HostSession | null {
  try {
    return parseHostSession(
      JSON.parse(storage.getItem(`${SESSION_KEY_PREFIX}${scope}`) ?? 'null'),
    );
  } catch {
    return null;
  }
}

function saveHostSession(
  storage: SessionStorage,
  scope: string,
  session: HostSession | null,
) {
  try {
    if (session) {
      storage.setItem(`${SESSION_KEY_PREFIX}${scope}`, JSON.stringify(session));
    } else {
      storage.removeItem(`${SESSION_KEY_PREFIX}${scope}`);
    }
  } catch {
    // Session restoration is best-effort.
  }
}

function getDeepLinkedHostSession(url: string): HostSession | null {
  try {
    const parameters = new URL(url).searchParams;
    const packageId = parameters.get(HOST_PARAMETERS.package)?.trim();
    if (!packageId) return null;
    return parseHostSession({
      packageId,
      gameActive: parameters.get(HOST_PARAMETERS.active) === '1',
      finished: parameters.get(HOST_PARAMETERS.finished) === '1',
      position: {
        questionIndex:
          Number(parameters.get(HOST_PARAMETERS.question) ?? '1') - 1,
        questionPartIndex:
          Number(parameters.get(HOST_PARAMETERS.questionPart) ?? '1') - 1,
        stage: parameters.get(HOST_PARAMETERS.stage) ?? 'tour',
      },
    });
  } catch {
    return null;
  }
}

function getHostDeepLink(url: string, session: HostSession | null) {
  const nextUrl = new URL(url);
  for (const parameter of Object.values(HOST_PARAMETERS)) {
    nextUrl.searchParams.delete(parameter);
  }
  if (session) {
    nextUrl.searchParams.set('view', 'host');
    nextUrl.searchParams.set(HOST_PARAMETERS.package, session.packageId);
    if (session.gameActive)
      nextUrl.searchParams.set(HOST_PARAMETERS.active, '1');
    if (session.finished)
      nextUrl.searchParams.set(HOST_PARAMETERS.finished, '1');
    nextUrl.searchParams.set(
      HOST_PARAMETERS.question,
      String(session.position.questionIndex + 1),
    );
    if (session.position.questionPartIndex > 0) {
      nextUrl.searchParams.set(
        HOST_PARAMETERS.questionPart,
        String(session.position.questionPartIndex + 1),
      );
    }
    nextUrl.searchParams.set(HOST_PARAMETERS.stage, session.position.stage);
  }
  return nextUrl.href;
}

export {
  type HostSession,
  loadHostSession,
  saveHostSession,
  getDeepLinkedHostSession,
  getHostDeepLink,
};
