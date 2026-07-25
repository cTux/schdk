import type { ReactElement, ReactNode } from 'react';

export interface TooltipProviderProps {
  children: ReactNode;
}

export interface TooltipProps {
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  trigger: ReactElement;
}
