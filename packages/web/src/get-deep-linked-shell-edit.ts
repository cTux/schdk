import type { ShellEditTarget } from '@schdk/ui/shell';
import { EDIT_PARAMETER } from './edit-parameter';

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
    return hasPackageName
      ? { kind: 'package', name: value!.slice('package:'.length) }
      : null;
  } catch {
    return null;
  }
}
