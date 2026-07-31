import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface ActionToolbarButtonProps {
  icon: IconDefinition;
  label: string;
  pressed?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick(): void;
}

export { type ActionToolbarButtonProps };
