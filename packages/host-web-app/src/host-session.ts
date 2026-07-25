import type { HostQuestionStage } from '@schdk/ui/host';
import type { GamePosition } from './game-flow';

const SESSION_KEY_PREFIX = 'schdk.host-session:';
const HOST_PACKAGE_PARAMETER = 'hostPackage';
const HOST_ACTIVE_PARAMETER = 'hostActive';
const HOST_FINISHED_PARAMETER = 'hostFinished';
const HOST_QUESTION_PARAMETER = 'hostQuestion';
const HOST_STAGE_PARAMETER = 'hostStage';
const STAGES: HostQuestionStage[] = [
  'intro',
  'handout',
  'question',
  'timer',
  'answerComment',
  'answer',
];

export interface HostSession {
  packageId: string;
  gameActive: boolean;
  finished: boolean;
  position: GamePosition;
}

type SessionStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

function parseHostSession(value: unknown): HostSession | null {
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
      stage: position.stage as HostQuestionStage,
    },
  };
}

export function loadHostSession(
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

export function saveHostSession(
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

export function getDeepLinkedHostSession(url: string): HostSession | null {
  try {
    const parameters = new URL(url).searchParams;
    const packageId = parameters.get(HOST_PACKAGE_PARAMETER)?.trim();
    if (!packageId) return null;
    return parseHostSession({
      packageId,
      gameActive: parameters.get(HOST_ACTIVE_PARAMETER) === '1',
      finished: parameters.get(HOST_FINISHED_PARAMETER) === '1',
      position: {
        questionIndex:
          Number(parameters.get(HOST_QUESTION_PARAMETER) ?? '1') - 1,
        stage: parameters.get(HOST_STAGE_PARAMETER) ?? 'intro',
      },
    });
  } catch {
    return null;
  }
}

export function getHostDeepLink(url: string, session: HostSession | null) {
  const nextUrl = new URL(url);
  for (const parameter of [
    HOST_PACKAGE_PARAMETER,
    HOST_ACTIVE_PARAMETER,
    HOST_FINISHED_PARAMETER,
    HOST_QUESTION_PARAMETER,
    HOST_STAGE_PARAMETER,
  ]) {
    nextUrl.searchParams.delete(parameter);
  }
  if (session) {
    nextUrl.searchParams.set('view', 'host');
    nextUrl.searchParams.set(HOST_PACKAGE_PARAMETER, session.packageId);
    if (session.gameActive)
      nextUrl.searchParams.set(HOST_ACTIVE_PARAMETER, '1');
    if (session.finished) {
      nextUrl.searchParams.set(HOST_FINISHED_PARAMETER, '1');
    }
    nextUrl.searchParams.set(
      HOST_QUESTION_PARAMETER,
      String(session.position.questionIndex + 1),
    );
    nextUrl.searchParams.set(HOST_STAGE_PARAMETER, session.position.stage);
  }
  return nextUrl.href;
}
