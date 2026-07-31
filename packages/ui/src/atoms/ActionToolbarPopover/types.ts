import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ReactNode } from 'react';

interface ActionToolbarPopoverProps {
  icon: IconDefinition;
  label: string;
  children: ReactNode;
}

export { type ActionToolbarPopoverProps };
