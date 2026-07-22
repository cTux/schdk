import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ButtonHTMLAttributes } from 'react';
import { Button, type ButtonVariant } from './Button';

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  icon: IconDefinition;
  label: string;
  variant?: ButtonVariant;
}

export function IconButton({ icon, label, title, ...props }: IconButtonProps) {
  return (
    <Button aria-label={label} title={title ?? label} {...props}>
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
    </Button>
  );
}
