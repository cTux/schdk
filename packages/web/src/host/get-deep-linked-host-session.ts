import { type HostSession } from './host-session';
import { HOST_PACKAGE_PARAMETER } from './host-package-parameter';
import { parseHostSession } from './parse-host-session';
import { HOST_ACTIVE_PARAMETER } from './host-active-parameter';
import { HOST_FINISHED_PARAMETER } from './host-finished-parameter';
import { HOST_QUESTION_PARAMETER } from './host-question-parameter';
import { HOST_QUESTION_PART_PARAMETER } from './host-question-part-parameter';
import { HOST_STAGE_PARAMETER } from './host-stage-parameter';

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
        questionPartIndex:
          Number(parameters.get(HOST_QUESTION_PART_PARAMETER) ?? '1') - 1,
        stage: parameters.get(HOST_STAGE_PARAMETER) ?? 'tour',
      },
    });
  } catch {
    return null;
  }
}
