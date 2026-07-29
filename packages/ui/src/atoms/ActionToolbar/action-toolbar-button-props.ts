import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ActionToolbarButtonProps {
  icon: IconDefinition;
  label: string;
  pressed?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick(): void;
}
