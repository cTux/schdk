import { Popover } from '@base-ui/react/popover';
import { Toolbar } from '@base-ui/react/toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '../Tooltip';
import type { ActionToolbarPopoverProps } from './types';

export function ActionToolbarPopover({
  icon,
  label,
  children,
}: ActionToolbarPopoverProps) {
  return (
    <Popover.Root>
      <Tooltip
        label={label}
        trigger={
          <Popover.Trigger
            render={
              <Toolbar.Button className="action-button" aria-label={label} />
            }
          >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
          </Popover.Trigger>
        }
      />
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          sideOffset={10}
          className="ui-popover-positioner"
        >
          <Popover.Popup className="ui-popover">
            <Popover.Arrow className="ui-popover-arrow" />
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
