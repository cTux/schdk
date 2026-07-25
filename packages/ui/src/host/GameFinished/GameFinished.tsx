import './styles.scss';

import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';

export interface GameFinishedProps {
  onReturn(): void;
}

export function GameFinished({ onReturn }: GameFinishedProps) {
  const { copy } = useLocalization();

  return (
    <section className="game-finished">
      <h2>{copy.host.finished}</h2>
      <Button type="button" variant="primary" onClick={onReturn}>
        {copy.host.returnToGames}
      </Button>
    </section>
  );
}
