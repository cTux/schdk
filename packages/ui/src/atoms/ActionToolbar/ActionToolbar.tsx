import { Popover } from '@base-ui/react/popover';
import { Toolbar } from '@base-ui/react/toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Tooltip } from '../Tooltip';
import type {
  ActionToolbarButtonProps,
  ActionToolbarPopoverProps,
  ActionToolbarProps,
} from './types';

export function ActionToolbar({ label, children }: ActionToolbarProps) {
  return (
    <Toolbar.Root className="action-toolbar" aria-label={label}>
      {children}
    </Toolbar.Root>
  );
}

export function ActionToolbarButton({
  icon,
  label,
  pressed,
  danger = false,
  disabled,
  onClick,
}: ActionToolbarButtonProps) {
  return (
    <Tooltip
      label={label}
      trigger={
        <Toolbar.Button
          className={classNames('action-button', { danger })}
          aria-label={label}
          aria-pressed={pressed}
          disabled={disabled}
          onClick={onClick}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </Toolbar.Button>
      }
    />
  );
}

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

export function ActionToolbarSeparator() {
  return <Toolbar.Separator className="action-toolbar-separator" />;
}
