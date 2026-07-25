import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { HostPackageDetails } from '../HostView';

export interface GamePackageDetailsProps {
  details: HostPackageDetails;
  onBack(): void;
  onStart(): void;
}

export function GamePackageDetails({
  details,
  onBack,
  onStart,
}: GamePackageDetailsProps) {
  const { copy } = useLocalization();

  return (
    <section className="game-package-details">
      <div className="game-package-heading">
        <p className="eyebrow">{copy.host.packageReady}</p>
        <h2>{details.title}</h2>
        <p>{details.fileName}</p>
      </div>
      <dl className="game-package-stats">
        <div>
          <dt>{copy.host.rounds}</dt>
          <dd>{details.roundCount}</dd>
        </div>
        <div>
          <dt>{copy.host.questions}</dt>
          <dd>{details.questionCount}</dd>
        </div>
        <div>
          <dt>{copy.host.handouts}</dt>
          <dd>{details.handoutCount}</dd>
        </div>
      </dl>
      <p className="game-package-note">{copy.host.hiddenContent}</p>
      <div className="game-package-actions">
        <Button type="button" onClick={onBack}>
          {copy.host.back}
        </Button>
        <Button type="button" variant="primary" onClick={onStart}>
          {copy.host.start}
        </Button>
      </div>
    </section>
  );
}
