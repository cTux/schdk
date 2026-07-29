import type { ButtonHTMLAttributes } from 'react';
import { type ButtonVariant } from './button-variant';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
