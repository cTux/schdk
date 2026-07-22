import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className = '',
  variant = 'default',
  ...props
}: ButtonProps) {
  const classes = [variant === 'default' ? '' : variant, className]
    .filter(Boolean)
    .join(' ');
  return <button className={classes || undefined} {...props} />;
}
