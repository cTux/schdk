import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import { ZoomableImage } from '../ZoomableImage';
import { type HandoutPreviewProps } from './handout-preview-props';

function HandoutPreview({ handout, onRemove }: HandoutPreviewProps) {
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

export { type HandoutPreviewProps, HandoutPreview };
