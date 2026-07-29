import classNames from 'classnames';

export function GameQuestionParts({
  currentPartIndex,
  entering,
  parts,
}: {
  currentPartIndex: number;
  entering: boolean;
  parts: string[];
}) {
  return parts.slice(0, currentPartIndex + 1).map((part, index) => (
    <p
      className={classNames('game-question-part', {
        'is-entering is-forward': entering && index === currentPartIndex,
      })}
      key={index}
    >
      {part}
    </p>
  ));
}
