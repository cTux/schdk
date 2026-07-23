import { Button } from '../atoms/Button';

interface GameFinishedProps {
  onReturn(): void;
}

export function GameFinished({ onReturn }: GameFinishedProps) {
  return (
    <section className="game-finished">
      <h2>Дякуємо за гру!</h2>
      <Button type="button" variant="primary" onClick={onReturn}>
        Повернутися до ігор
      </Button>
    </section>
  );
}
