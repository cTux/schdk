import type { ShellEditTarget } from '@schdk/ui/shell';
import { EDIT_PARAMETER } from '../../constants/shell/edit-parameter';

export function getDeepLinkedShellEdit(url: string): ShellEditTarget | null {
  try {
    const value = new URL(url).searchParams.get(EDIT_PARAMETER);
    const question = value?.match(/^question:(account|global):(.+)$/);
    if (question) {
      return {
        kind: 'question',
        global: question[1] === 'global',
        name: question[2]!,
      };
    }
    const hasPackageName =
      value?.startsWith('package:') && value.length > 'package:'.length;
    if (hasPackageName) {
      return { kind: 'package', name: value!.slice('package:'.length) };
    }
    const dictionary = value?.match(
      /^dictionary:(question-difficulty|question-recognizability)$/u,
    );
    return dictionary
      ? {
          kind: 'dictionary',
          id: dictionary[1] as
            | 'question-difficulty'
            | 'question-recognizability',
        }
      : null;
  } catch {
    return null;
  }
}
