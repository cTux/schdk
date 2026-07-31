import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ReactNode } from 'react';

export interface ActionToolbarPopoverProps {
  icon: IconDefinition;
  label: string;
  children: ReactNode;
}
