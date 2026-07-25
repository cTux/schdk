import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ButtonHTMLAttributes } from 'react';
import { Button, type ButtonVariant } from '../Button';
import { Tooltip } from '../Tooltip';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  icon: IconDefinition;
  label: string;
  variant?: ButtonVariant;
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Tooltip
      label={label}
      trigger={
        <Button className="icon-button" aria-label={label} {...props}>
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </Button>
      }
    />
  );
}
