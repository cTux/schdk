import type { ShellViewName } from '@schdk/ui/shell';
import { VIEW_PARAMETER } from '../../constants/shell/view-parameter';

export function getShellDeepLink(url: string, view: ShellViewName) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(VIEW_PARAMETER, view);
  return nextUrl.href;
}
