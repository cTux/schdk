import type { ReactNode } from 'react';
import type { GameLayout, GameLayoutElementId } from '../../options/types';

export interface GameLayoutItemProps {
  children: ReactNode;
  id: GameLayoutElementId;
  layout: GameLayout | null;
}
