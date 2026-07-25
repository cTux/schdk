import './styles.scss';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { TooltipProps, TooltipProviderProps } from './types';

export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={450} closeDelay={100} timeout={400}>
      {children}
    </BaseTooltip.Provider>
  );
}

export function Tooltip({ label, side, trigger }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={trigger} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={8}
          className="ui-tooltip-positioner"
        >
          <BaseTooltip.Popup className="ui-tooltip">
            <BaseTooltip.Arrow className="ui-tooltip-arrow" />
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
