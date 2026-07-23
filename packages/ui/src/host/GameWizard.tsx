import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../atoms/Button';
import type {
  HostGameTransition,
  HostGameView,
  HostQuestionStage,
} from './types';

interface GameWizardProps {
  game: HostGameView;
  onBack(): void;
  onNext(): void;
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

export function GameWizard({ game, onBack, onNext }: GameWizardProps) {
  const visible = new Set(game.visibleStages);
  const isIntro = game.currentStage === 'intro';
  const questionChangingClass = game.transition.questionChanging
    ? ` is-${game.transition.phase}-${game.transition.direction}`
    : '';

  return (
    <section className="game-wizard" aria-label="Проведення гри">
      <div className="game-progress" aria-label="Прогрес гри">
        <strong>{game.title}</strong>
        <span>
          {game.questionNumber} / {game.questionCount}
        </span>
      </div>
      <div className="game-wizard-canvas">
        {isIntro ? (
          <div
            className={`question-intro${stageMotionClass(
              'intro',
              game.currentStage,
              game.transition,
            )}${questionChangingClass}`}
          >
            Питання №{game.questionNumber}
          </div>
        ) : (
          <div className={`question-board${questionChangingClass}`}>
            <div className="question-board-top">
              <div className="handout-slot">
                {visible.has('handout') && game.question.handout && (
                  <img
                    className={`game-handout${stageMotionClass(
                      'handout',
                      game.currentStage,
                      game.transition,
                    )}`}
                    src={game.question.handout.dataUrl}
                    alt="Роздатковий матеріал"
                  />
                )}
              </div>
              <div className="question-slot">
                {visible.has('question') && (
                  <p
                    className={`game-question${stageMotionClass(
                      'question',
                      game.currentStage,
                      game.transition,
                    )}`}
                  >
                    {game.question.question}
                  </p>
                )}
              </div>
            </div>
            <div className="question-board-bottom">
              <div className="question-bottom-left">
                {visible.has('timer') && (
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
                )}
                {visible.has('answerComment') &&
                  game.question.answerComment && (
                    <p
                      className={`game-answer-comment${stageMotionClass(
                        'answerComment',
                        game.currentStage,
                        game.transition,
                      )}`}
                    >
                      {game.question.answerComment}
                    </p>
                  )}
              </div>
              <div className="answer-slot">
                {visible.has('answer') && (
                  <div
                    className={`game-answer${stageMotionClass(
                      'answer',
                      game.currentStage,
                      game.transition,
                    )}`}
                  >
                    <span>Відповідь</span>
                    <strong>{game.question.answer}</strong>
                    {game.question.alternativeAnswers.length > 0 && (
                      <div className="game-alternative-answers">
                        <span>Також зараховується:</span>
                        <p>{game.question.alternativeAnswers.join(' · ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <nav className="game-controls" aria-label="Керування станами питання">
        <Button
          type="button"
          disabled={game.controlsDisabled || !game.canGoBack}
          onClick={onBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          <span>Попередній стан</span>
          <kbd>← · PgUp · Backspace</kbd>
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={game.controlsDisabled}
          onClick={onNext}
        >
          <span>Наступний стан</span>
          <kbd>Space · PgDn · →</kbd>
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Button>
      </nav>
    </section>
  );
}
