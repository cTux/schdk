import type { ReactNode } from 'react';
import { ActionToolbar } from '../src/atoms/ActionToolbar';

export function ToolbarStory({ children }: { children: ReactNode }) {
  return <ActionToolbar label="Storybook">{children}</ActionToolbar>;
}
