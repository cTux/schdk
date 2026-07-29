import classNames from 'classnames';

export function GameAnswer({
  answer,
  className,
}: {
  answer: string;
  className?: string;
}) {
  return (
    <div className={classNames('game-answer', className)}>
      <strong>{answer}</strong>
    </div>
  );
}
