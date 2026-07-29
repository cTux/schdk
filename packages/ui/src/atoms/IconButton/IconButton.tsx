import './styles.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { type IconButtonProps } from './icon-button-props';

function IconButton({
  icon,
  label,
  tooltipLabel = label,
  tooltipSide,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      className={classNames('icon-button', className)}
      aria-label={label}
      disabled={disabled}
      {...props}
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
    </Button>
  );
  return (
    <Tooltip
      label={tooltipLabel}
      side={tooltipSide}
      trigger={
        disabled ? (
          <span
            className="disabled-icon-button-trigger"
            tabIndex={0}
            aria-label={tooltipLabel}
          >
            {button}
          </span>
        ) : (
          button
        )
      }
    />
  );
}

export { type IconButtonProps, IconButton };
