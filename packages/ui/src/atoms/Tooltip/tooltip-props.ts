import type { ReactElement } from 'react';

export interface TooltipProps {
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  trigger: ReactElement;
}
