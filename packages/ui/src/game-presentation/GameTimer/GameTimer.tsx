import classNames from 'classnames';

export function GameTimer({
  seconds,
  className,
}: {
  seconds: number;
  className?: string;
}) {
  const text = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;
  return (
    <div
      className={classNames('game-timer', className, {
        'is-submission-time': seconds > 0 && seconds <= 10,
      })}
      role="timer"
      aria-live="off"
    >
      <strong>{text}</strong>
    </div>
  );
}
