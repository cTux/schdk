import './styles.scss';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ButtonHTMLAttributes } from 'react';
import { Button, type ButtonVariant } from '../Button';
import { Tooltip, type TooltipProps } from '../Tooltip';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  icon: IconDefinition;
  label: string;
  tooltipLabel?: string;
  tooltipSide?: TooltipProps['side'];
  variant?: ButtonVariant;
}

export function IconButton({
  icon,
  label,
  tooltipLabel = label,
  tooltipSide,
  disabled,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      className="icon-button"
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
