import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ButtonHTMLAttributes } from 'react';
import { type ButtonVariant } from '../Button';
import { type TooltipProps } from '../Tooltip';

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
