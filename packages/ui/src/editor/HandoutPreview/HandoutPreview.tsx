import './styles.scss';

import type { Handout } from '@schdk/common';
import { Button } from '../../atoms/Button';
import { ZoomableImage } from '../ZoomableImage';

export interface HandoutPreviewProps {
  handout: Handout;
  onRemove(): void;
}

export function HandoutPreview({ handout, onRemove }: HandoutPreviewProps) {
  return (
    <div className="handout-preview">
      <ZoomableImage
        src={handout.dataUrl}
        alt="Роздатка до питання"
        openLabel="Відкрити роздатку у повному розмірі"
        title="Перегляд роздатки"
      />
      <Button className="handout-remove" type="button" onClick={onRemove}>
        Видалити
      </Button>
    </div>
  );
}
