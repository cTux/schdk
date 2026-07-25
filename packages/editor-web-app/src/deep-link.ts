import { QUESTION_COUNT } from '@schdk/common';

const PACKAGE_PARAMETER = 'package';
const QUESTION_PARAMETER = 'question';

export function getDeepLinkedPackageName(url: string): string | null {
  try {
    return new URL(url).searchParams.get(PACKAGE_PARAMETER)?.trim() || null;
  } catch {
    return null;
  }
}

export function getPackageDeepLink(url: string, packageName: string | null) {
  const nextUrl = new URL(url);
  if (packageName) nextUrl.searchParams.set(PACKAGE_PARAMETER, packageName);
  else {
    nextUrl.searchParams.delete(PACKAGE_PARAMETER);
    nextUrl.searchParams.delete(QUESTION_PARAMETER);
  }
  return nextUrl.href;
}

export function getDeepLinkedQuestionIndex(url: string): number | null {
  try {
    const question = Number(new URL(url).searchParams.get(QUESTION_PARAMETER));
    return Number.isSafeInteger(question) &&
      question >= 1 &&
      question <= QUESTION_COUNT
      ? question - 1
      : null;
  } catch {
    return null;
  }
}

export function getQuestionDeepLink(url: string, selectedIndex: number) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(QUESTION_PARAMETER, String(selectedIndex + 1));
  return nextUrl.href;
}
