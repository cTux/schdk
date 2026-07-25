import './styles.scss';

import type { ImageHandout } from '@schdk/common';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import { ZoomableImage } from '../ZoomableImage';

export interface HandoutPreviewProps {
  handout: ImageHandout;
  onRemove(): void;
}

export function HandoutPreview({ handout, onRemove }: HandoutPreviewProps) {
  const { copy } = useLocalization();

  return (
    <div className="handout-preview">
      <ZoomableImage
        src={handout.dataUrl}
        alt={copy.editor.questionHandoutAlt}
        openLabel={copy.editor.openHandout}
        title={copy.editor.handoutPreview}
      />
      <Button className="handout-remove" type="button" onClick={onRemove}>
        {copy.shared.remove}
      </Button>
    </div>
  );
}
