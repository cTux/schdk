import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import { type GameFinishedProps } from './game-finished-props';

function GameFinished({ onReturn }: GameFinishedProps) {
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

export { type GameFinishedProps, GameFinished };
