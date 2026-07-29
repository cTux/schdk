import { SESSION_KEY_PREFIX } from './session-key-prefix';

export function sessionKey(scope: string) {
  return `${SESSION_KEY_PREFIX}${scope}`;
}
