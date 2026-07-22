import type { Input } from 'electron';

export function isReloadShortcut(
  input: Pick<Input, 'key' | 'control' | 'meta'>,
): boolean {
  return (
    input.key === 'F5' ||
    ((input.control || input.meta) && input.key.toLowerCase() === 'r')
  );
}
