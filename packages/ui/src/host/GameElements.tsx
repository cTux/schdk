interface ElementProps {
  children: string;
  className?: string;
}

const classes = (base: string, className = '') => `${base}${className}`;

export function GameLogo() {
  return <AppIcon className="game-logo" />;
}

export function GameProgress({
  questionNumber,
  questionCount,
}: {
  questionNumber: number;
  questionCount: number;
}) {
  return (
    <div className="game-progress" aria-label="Прогрес гри">
      <span>
        {questionNumber} / {questionCount}
      </span>
    </div>
  );
}

export function GameQuestionIntro({
  questionNumber,
  className,
}: {
  questionNumber: number;
  className?: string;
}) {
  return (
    <div className={classes('question-intro', className)}>
      Питання №{questionNumber}
    </div>
  );
}

export function GameHandout({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  const classNames = classes('game-handout', className);
  return src ? (
    <img className={classNames} src={src} alt="Роздатковий матеріал" />
  ) : (
    <div className={`${classNames} game-handout-placeholder`}>Роздатка</div>
  );
}

export function GameQuestion({ children, className }: ElementProps) {
  return <p className={classes('game-question', className)}>{children}</p>;
}

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
      className={classes('game-timer', className)}
      role="timer"
      aria-live="off"
    >
      <strong>{text}</strong>
    </div>
  );
}

export function GameAnswerComment({ children, className }: ElementProps) {
  return (
    <p className={classes('game-answer-comment', className)}>{children}</p>
  );
}

export function GameAnswer({
  answer,
  className,
}: {
  answer: string;
  className?: string;
}) {
  return (
    <div className={classes('game-answer', className)}>
      <strong>{answer}</strong>
    </div>
  );
}

export function GameAlternativeAnswer({ children, className }: ElementProps) {
  return (
    <p className={classes('game-alternative-answer', className)}>{children}</p>
  );
}

export function GameControls({
  canGoBack,
  controlsDisabled,
  preview = false,
  onBack,
  onNext,
}: {
  canGoBack: boolean;
  controlsDisabled: boolean;
  preview?: boolean;
  onBack(): void;
  onNext(): void;
}) {
  return (
    <nav
      className={`game-controls${preview ? ' is-preview' : ''}`}
      aria-label="Керування станами питання"
    >
      <Button
        type="button"
        variant="ghost"
        aria-label="Попередній стан"
        disabled={preview || controlsDisabled || !canGoBack}
        tabIndex={preview ? -1 : undefined}
        onClick={onBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
        <kbd>← · PgUp · Backspace</kbd>
      </Button>
      <Button
        type="button"
        variant="ghost"
        aria-label="Наступний стан"
        disabled={preview || controlsDisabled}
        tabIndex={preview ? -1 : undefined}
        onClick={onNext}
      >
        <kbd>Space · PgDn · →</kbd>
        <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Button>
    </nav>
  );
}
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppIcon } from '../atoms/AppIcon';
import { Button } from '../atoms/Button';
