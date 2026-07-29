import { type HostSession } from './host-session';
import { HOST_PACKAGE_PARAMETER } from './host-package-parameter';
import { HOST_ACTIVE_PARAMETER } from './host-active-parameter';
import { HOST_FINISHED_PARAMETER } from './host-finished-parameter';
import { HOST_QUESTION_PARAMETER } from './host-question-parameter';
import { HOST_QUESTION_PART_PARAMETER } from './host-question-part-parameter';
import { HOST_STAGE_PARAMETER } from './host-stage-parameter';

export function getHostDeepLink(url: string, session: HostSession | null) {
  const nextUrl = new URL(url);
  for (const parameter of [
    HOST_PACKAGE_PARAMETER,
    HOST_ACTIVE_PARAMETER,
    HOST_FINISHED_PARAMETER,
    HOST_QUESTION_PARAMETER,
    HOST_QUESTION_PART_PARAMETER,
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
    if (session.position.questionPartIndex > 0) {
      nextUrl.searchParams.set(
        HOST_QUESTION_PART_PARAMETER,
        String(session.position.questionPartIndex + 1),
      );
    }
    nextUrl.searchParams.set(HOST_STAGE_PARAMETER, session.position.stage);
  }
  return nextUrl.href;
}
