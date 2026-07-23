import { Button } from '../atoms/Button';
import type { HostPackageDetails } from './HostView';

interface GamePackageDetailsProps {
  details: HostPackageDetails;
  gameStarted: boolean;
  onBack(): void;
  onStart(): void;
}

export function GamePackageDetails({
  details,
  gameStarted,
  onBack,
  onStart,
}: GamePackageDetailsProps) {
  return (
    <section className="game-package-details">
      <div className="game-package-heading">
        <p className="eyebrow">Пакет готовий</p>
        <h2>{details.title}</h2>
        <p>{details.fileName}</p>
      </div>
      <dl className="game-package-stats">
        <div>
          <dt>Раундів</dt>
          <dd>{details.roundCount}</dd>
        </div>
        <div>
          <dt>Питань</dt>
          <dd>{details.questionCount}</dd>
        </div>
        <div>
          <dt>Роздаткових матеріалів</dt>
          <dd>{details.handoutCount}</dd>
        </div>
      </dl>
      <p className="game-package-note">
        Питання та відповіді залишаються прихованими до початку гри.
      </p>
      <div className="game-package-actions">
        <Button type="button" onClick={onBack}>
          Повернутися назад
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={gameStarted}
          onClick={onStart}
        >
          {gameStarted ? 'Гру розпочато' : 'Почати гру'}
        </Button>
      </div>
    </section>
  );
}
