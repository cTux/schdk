import type { ReactNode } from 'react';
import { type ActionToolbarButtonProps } from './types/action-toolbar-button-props';
import { type ActionToolbarPopoverProps } from './types/action-toolbar-popover-props';

interface ActionToolbarProps {
  label: string;
  children: ReactNode;
}

export {
  type ActionToolbarProps,
  type ActionToolbarButtonProps,
  type ActionToolbarPopoverProps,
};
