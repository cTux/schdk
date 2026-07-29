import type { ReactNode } from 'react';
import { ActionToolbar } from '../src/atoms/ActionToolbar';

const AREA_CLASS_NAMES = {
  editor: 'editor-app',
  host: 'host-app',
  'visual-editor': 'visual-editor',
} as const;

type ProductionStoryProps = {
  area?: keyof typeof AREA_CLASS_NAMES;
  children: ReactNode;
  toolbar?: boolean;
};

export function ProductionStory({
  area,
  children,
  toolbar = false,
}: ProductionStoryProps) {
  const content = toolbar ? (
    <ActionToolbar label="Storybook">{children}</ActionToolbar>
  ) : (
    children
  );

  return area ? (
    <div className={AREA_CLASS_NAMES[area]}>{content}</div>
  ) : (
    content
  );
}
