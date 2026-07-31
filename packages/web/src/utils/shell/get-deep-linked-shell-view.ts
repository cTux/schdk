import type { ShellViewName } from '@schdk/ui/shell';
import { VIEW_PARAMETER } from '../../constants/shell/view-parameter';
import { isShellViewName } from './is-shell-view-name';

export function getDeepLinkedShellView(url: string): ShellViewName | null {
  try {
    const view = new URL(url).searchParams.get(VIEW_PARAMETER);
    return isShellViewName(view) ? view : null;
  } catch {
    return null;
  }
}
