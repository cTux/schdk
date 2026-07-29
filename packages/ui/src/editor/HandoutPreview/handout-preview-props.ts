import type { ImageHandout } from '@schdk/common';

export interface HandoutPreviewProps {
  handout: ImageHandout;
  onRemove(): void;
}
