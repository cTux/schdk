import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ReactNode } from 'react';

export interface ActionToolbarProps {
  label: string;
  children: ReactNode;
}

export interface ActionToolbarButtonProps {
  icon: IconDefinition;
  label: string;
  pressed?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick(): void;
}

export interface ActionToolbarPopoverProps {
  icon: IconDefinition;
  label: string;
  children: ReactNode;
}
