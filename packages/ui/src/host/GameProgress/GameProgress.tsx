import { useLocalization } from '../../localization';

export function GameProgress({
  questionNumber,
  questionCount,
}: {
  questionNumber: number;
  questionCount: number;
}) {
  const { copy } = useLocalization();

  return (
    <div className="game-progress" aria-label={copy.host.gameProgress}>
      <span>
        {questionNumber} / {questionCount}
      </span>
    </div>
  );
}
