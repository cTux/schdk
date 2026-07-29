import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { TooltipProviderProps } from './types';

export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={450} closeDelay={100} timeout={400}>
      {children}
    </BaseTooltip.Provider>
  );
}
