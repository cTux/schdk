import { PACKAGE_PARAMETER } from './package-parameter';
import { QUESTION_PARAMETER } from './question-parameter';

export function getPackageDeepLink(url: string, packageName: string | null) {
  const nextUrl = new URL(url);
  if (packageName) nextUrl.searchParams.set(PACKAGE_PARAMETER, packageName);
  else {
    nextUrl.searchParams.delete(PACKAGE_PARAMETER);
    nextUrl.searchParams.delete(QUESTION_PARAMETER);
  }
  return nextUrl.href;
}
