import { Toolbar } from '@base-ui/react/toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Tooltip } from '../Tooltip';
import type { ActionToolbarButtonProps } from './types';

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
