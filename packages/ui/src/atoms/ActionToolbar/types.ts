import type { ReactNode } from 'react';
import { type ActionToolbarButtonProps } from './action-toolbar-button-props';
import { type ActionToolbarPopoverProps } from './action-toolbar-popover-props';

interface ActionToolbarProps {
  label: string;
  children: ReactNode;
}

export {
  type ActionToolbarProps,
  type ActionToolbarButtonProps,
  type ActionToolbarPopoverProps,
};
