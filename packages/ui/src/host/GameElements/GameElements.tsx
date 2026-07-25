import './styles.scss';

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import type { CustomGameElement } from '../../options/types';
import { FitTextObserver } from '../FitTextObserver';

export interface ElementProps {
  children: string;
  className?: string;
}

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
    <div className={classNames('question-intro', className)}>
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
  const handoutClasses = classNames('game-handout', className);
  return src ? (
    <img className={handoutClasses} src={src} alt="Роздатковий матеріал" />
  ) : (
    <div className={classNames(handoutClasses, 'game-handout-placeholder')}>
      Роздатка
    </div>
  );
}

export function GameQuestion({ children, className }: ElementProps) {
  return <p className={classNames('game-question', className)}>{children}</p>;
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
      className={classNames('game-timer', className)}
      role="timer"
      aria-live="off"
    >
      <strong>{text}</strong>
    </div>
  );
}

export function GameAnswerComment({ children, className }: ElementProps) {
  return (
    <p className={classNames('game-answer-comment', className)}>{children}</p>
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
    <div className={classNames('game-answer', className)}>
      <strong>{answer}</strong>
    </div>
  );
}

export function GameAlternativeAnswer({ children, className }: ElementProps) {
  return (
    <p className={classNames('game-alternative-answer', className)}>
      {children}
    </p>
  );
}

export function GameCustomElement({
  element,
  preview = false,
}: {
  element: CustomGameElement;
  preview?: boolean;
}) {
  const { position } = element;
  if (position.hidden && !preview) return null;
  return (
    <div
      className={classNames(
        'game-custom-element',
        `game-custom-${element.kind}`,
      )}
      style={
        {
          '--game-layout-x': `${position.x}%`,
          '--game-layout-y': `${position.y}%`,
          '--game-layout-width': `${position.width}%`,
          '--game-layout-height': `${position.height}%`,
          '--game-font-scale': position.fontScale,
          '--game-text-color': position.textColor,
          '--game-grow-align':
            position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
          '--game-image-position': position.imagePosition,
        } as CSSProperties
      }
    >
      {element.kind === 'text' ? (
        <p>{element.text}</p>
      ) : element.image ? (
        <img src={element.image} alt="" />
      ) : preview ? (
        <span className="game-custom-image-placeholder" aria-hidden="true">
          Зображення
        </span>
      ) : null}
      {element.kind === 'text' && (
        <FitTextObserver enabled={position.fitTextToHeight} />
      )}
    </div>
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
      className={classNames('game-controls', { 'is-preview': preview })}
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
import { AppIcon } from '../../atoms/AppIcon';
import { Button } from '../../atoms/Button';
