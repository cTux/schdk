import classNames from 'classnames';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';

export function GameControls({
  copy = LOCALIZATION_COPY.uk,
  canGoBack,
  controlsDisabled,
  preview = false,
  onBack,
  onNext,
}: {
  copy?: LocalizationCopy;
  canGoBack: boolean;
  controlsDisabled: boolean;
  preview?: boolean;
  onBack(): void;
  onNext(): void;
}) {
  return (
    <nav
      className={classNames('game-controls', { 'is-preview': preview })}
      aria-label={copy.host.controls}
    >
      <Button
        type="button"
        variant="ghost"
        aria-label={copy.host.previousStage}
        disabled={preview || controlsDisabled || !canGoBack}
        tabIndex={preview ? -1 : undefined}
        onClick={onBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
        <kbd>{copy.host.previousStageKeys}</kbd>
      </Button>
      <Button
        type="button"
        variant="ghost"
        aria-label={copy.host.nextStage}
        disabled={preview || controlsDisabled}
        tabIndex={preview ? -1 : undefined}
        onClick={onNext}
      >
        <kbd>{copy.host.nextStageKeys}</kbd>
        <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Button>
    </nav>
  );
}
