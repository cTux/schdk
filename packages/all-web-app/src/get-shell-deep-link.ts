import type { ShellViewName } from '@schdk/ui/shell';
import { VIEW_PARAMETER } from './view-parameter';

export function getShellDeepLink(url: string, view: ShellViewName) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set(VIEW_PARAMETER, view);
  return nextUrl.href;
}
