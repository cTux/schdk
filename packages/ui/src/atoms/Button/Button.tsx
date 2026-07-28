import './styles.scss';

import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className = '',
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={
        classNames('ui-button', variant !== 'default' && variant, className) ||
        undefined
      }
      {...props}
    />
  );
}
