import type { GamePosition } from './game-flow';
import { loadHostSession } from './load-host-session';
import { saveHostSession } from './save-host-session';
import { getDeepLinkedHostSession } from './get-deep-linked-host-session';
import { getHostDeepLink } from './get-host-deep-link';

interface HostSession {
  packageId: string;
  gameActive: boolean;
  finished: boolean;
  position: GamePosition;
}

export {
  type HostSession,
  loadHostSession,
  saveHostSession,
  getDeepLinkedHostSession,
  getHostDeepLink,
};
