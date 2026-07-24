import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { CSSProperties, ReactNode } from 'react';
import { Button } from '../atoms/Button';
import type { GameLayout, GameLayoutElementId } from '../options/types';
import type {
  HostGameTransition,
  HostGameView,
  HostQuestionStage,
} from './types';

interface GameWizardProps {
  game: HostGameView;
  layout: GameLayout | null;
  onBack(): void;
  onNext(): void;
}

interface GameLayoutItemProps {
  children: ReactNode;
  id: GameLayoutElementId;
  layout: GameLayout | null;
}

function GameLayoutItem({ children, id, layout }: GameLayoutItemProps) {
  const position = layout?.[id];
  const style = position
    ? ({
        '--game-layout-x': `${position.x}%`,
        '--game-layout-y': `${position.y}%`,
      } as CSSProperties)
    : undefined;
  return (
    <div className={`game-layout-item game-layout-${id}`} style={style}>
      {children}
    </div>
  );
}

function timerText(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;
}

function stageMotionClass(
  stage: HostQuestionStage,
  currentStage: HostQuestionStage,
  transition: HostGameTransition,
) {
  if (stage !== currentStage || transition.phase === 'idle') return '';
  if (transition.phase === 'enter') {
    return ` is-entering is-${transition.direction}`;
  }
  if (transition.questionChanging) return '';
  return transition.direction === 'backward'
    ? ' is-exiting is-backward'
    : ' is-settling';
}

export function GameWizard({ game, layout, onBack, onNext }: GameWizardProps) {
  const visible = new Set(game.visibleStages);
  const isIntro = game.currentStage === 'intro';
  const isHandoutFocus = game.currentStage === 'handout';
  const questionChangingClass = game.transition.questionChanging
    ? ` is-${game.transition.phase}-${game.transition.direction}`
    : '';
  const customLayoutClass =
    layout && !isHandoutFocus ? ' has-custom-layout' : '';

  return (
    <section
      className={`game-wizard${customLayoutClass}`}
      aria-label="Проведення гри"
    >
      <GameLayoutItem id="progress" layout={layout}>
        <div className="game-progress" aria-label="Прогрес гри">
          <span>
            {game.questionNumber} / {game.questionCount}
          </span>
        </div>
      </GameLayoutItem>
      <div
        className={`game-wizard-canvas${isHandoutFocus ? ' is-handout-focus' : ''}`}
      >
        {isIntro ? (
          <GameLayoutItem id="intro" layout={layout}>
            <div
              className={`question-intro${stageMotionClass(
                'intro',
                game.currentStage,
                game.transition,
              )}${questionChangingClass}`}
            >
              Питання №{game.questionNumber}
            </div>
          </GameLayoutItem>
        ) : (
          <div className={`question-board${questionChangingClass}`}>
            <div className="question-board-top">
              <div className="handout-slot">
                {visible.has('handout') && game.question.handout && (
                  <GameLayoutItem id="handout" layout={layout}>
                    <img
                      className={`game-handout${stageMotionClass(
                        'handout',
                        game.currentStage,
                        game.transition,
                      )}`}
                      src={game.question.handout.dataUrl}
                      alt="Роздатковий матеріал"
                    />
                  </GameLayoutItem>
                )}
              </div>
              <div className="question-slot">
                {visible.has('question') && (
                  <GameLayoutItem id="question" layout={layout}>
                    <p
                      className={`game-question${stageMotionClass(
                        'question',
                        game.currentStage,
                        game.transition,
                      )}`}
                    >
                      {game.question.question}
                    </p>
                  </GameLayoutItem>
                )}
              </div>
            </div>
            <div className="question-board-bottom">
              <div className="question-bottom-left">
                {visible.has('timer') && (
                  <GameLayoutItem id="timer" layout={layout}>
                    <div
                      className={`game-timer${stageMotionClass(
                        'timer',
                        game.currentStage,
                        game.transition,
                      )}`}
                      role="timer"
                      aria-live="off"
                    >
                      <span>Час на обговорення</span>
                      <strong>{timerText(game.remainingSeconds)}</strong>
                    </div>
                  </GameLayoutItem>
                )}
                {visible.has('answerComment') &&
                  game.question.answerComment && (
                    <GameLayoutItem id="answer-comment" layout={layout}>
                      <p
                        className={`game-answer-comment${stageMotionClass(
                          'answerComment',
                          game.currentStage,
                          game.transition,
                        )}`}
                      >
                        {game.question.answerComment}
                      </p>
                    </GameLayoutItem>
                  )}
              </div>
              <div className="answer-slot">
                {visible.has('answer') && (
                  <GameLayoutItem id="answer" layout={layout}>
                    <div
                      className={`game-answer${stageMotionClass(
                        'answer',
                        game.currentStage,
                        game.transition,
                      )}`}
                    >
                      {game.question.alternativeAnswers.length > 0 && (
                        <div className="game-alternative-answers">
                          <span>Також зараховується:</span>
                          <p>{game.question.alternativeAnswers.join(' · ')}</p>
                        </div>
                      )}
                      <span>Відповідь</span>
                      <strong>{game.question.answer}</strong>
                    </div>
                  </GameLayoutItem>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <GameLayoutItem id="controls" layout={layout}>
        <nav className="game-controls" aria-label="Керування станами питання">
          <Button
            type="button"
            variant="ghost"
            aria-label="Попередній стан"
            disabled={game.controlsDisabled || !game.canGoBack}
            onClick={onBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            <kbd>← · PgUp · Backspace</kbd>
          </Button>
          <Button
            type="button"
            variant="ghost"
            aria-label="Наступний стан"
            disabled={game.controlsDisabled}
            onClick={onNext}
          >
            <kbd>Space · PgDn · →</kbd>
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Button>
        </nav>
      </GameLayoutItem>
    </section>
  );
}
