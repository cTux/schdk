import { QUESTION_PARAMETER } from './question-parameter';

export function getQuestionDeepLink(url: string, selectedIndex: number) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(QUESTION_PARAMETER, String(selectedIndex + 1));
  return nextUrl.href;
}
