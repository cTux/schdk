import { PACKAGE_PARAMETER } from './package-parameter';
import { getPackageDeepLink } from './get-package-deep-link';
import { getDeepLinkedQuestionIndex } from './get-deep-linked-question-index';
import { getQuestionDeepLink } from './get-question-deep-link';

function getDeepLinkedPackageName(url: string): string | null {
  try {
    return new URL(url).searchParams.get(PACKAGE_PARAMETER)?.trim() || null;
  } catch {
    return null;
  }
}

export {
  getDeepLinkedPackageName,
  getPackageDeepLink,
  getDeepLinkedQuestionIndex,
  getQuestionDeepLink,
};
