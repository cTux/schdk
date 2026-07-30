import type { ShellEditTarget } from '@schdk/ui/shell';
import { EDIT_PARAMETER } from './edit-parameter';

export function getShellEditDeepLink(
  url: string,
  target: ShellEditTarget | null,
) {
  const nextUrl = new URL(url);
  if (!target) nextUrl.searchParams.delete(EDIT_PARAMETER);
  else {
    nextUrl.searchParams.set(
      EDIT_PARAMETER,
      target.kind === 'package'
        ? `package:${target.name}`
        : target.kind === 'dictionary'
          ? `dictionary:${target.id}`
          : `question:${target.global ? 'global' : 'account'}:${target.name}`,
    );
  }
  return nextUrl.href;
}
