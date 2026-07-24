import type { CSSProperties, ReactNode } from 'react';
import type { GameLayout, GameLayoutElementId } from '../options/types';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameHandout,
  GameLogo,
  GameProgress,
  GameQuestion,
  GameQuestionIntro,
  GameTimer,
} from './GameElements';
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
        '--game-layout-width': `${position.width}%`,
        '--game-layout-height': `${position.height}%`,
        '--game-font-scale': position.fontScale,
        '--game-text-color': position.textColor,
        '--game-grow-align':
          position.textGrowDirection === 'up' ? 'flex-end' : 'flex-start',
        '--game-image-position': position.imagePosition,
      } as CSSProperties)
    : undefined;
  return (
    <div
      className={`game-layout-item game-layout-${id}${
        position ? ' has-position' : ''
      }`}
      style={style}
    >
      {children}
    </div>
  );
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
      <GameLayoutItem id="logo" layout={layout}>
        <GameLogo />
      </GameLayoutItem>
      <GameLayoutItem id="progress" layout={layout}>
        <GameProgress
          questionNumber={game.questionNumber}
          questionCount={game.questionCount}
        />
      </GameLayoutItem>
      <div
        className={`game-wizard-canvas${isHandoutFocus ? ' is-handout-focus' : ''}`}
      >
        {isIntro ? (
          <GameLayoutItem id="intro" layout={layout}>
            <GameQuestionIntro
              questionNumber={game.questionNumber}
              className={`${stageMotionClass(
                'intro',
                game.currentStage,
                game.transition,
              )}${questionChangingClass}`}
            />
          </GameLayoutItem>
        ) : (
          <div className={`question-board${questionChangingClass}`}>
            <div className="question-board-top">
              <div className="handout-slot">
                {visible.has('handout') && game.question.handout && (
                  <GameLayoutItem id="handout" layout={layout}>
                    <GameHandout
                      src={game.question.handout.dataUrl}
                      className={stageMotionClass(
                        'handout',
                        game.currentStage,
                        game.transition,
                      )}
                    />
                  </GameLayoutItem>
                )}
              </div>
              <div className="question-slot">
                {visible.has('question') && (
                  <GameLayoutItem id="question" layout={layout}>
                    <GameQuestion
                      className={stageMotionClass(
                        'question',
                        game.currentStage,
                        game.transition,
                      )}
                    >
                      {game.question.question}
                    </GameQuestion>
                  </GameLayoutItem>
                )}
              </div>
            </div>
            <div className="question-board-bottom">
              <div className="question-bottom-left">
                {visible.has('timer') && (
                  <GameLayoutItem id="timer" layout={layout}>
                    <GameTimer
                      seconds={game.remainingSeconds}
                      className={stageMotionClass(
                        'timer',
                        game.currentStage,
                        game.transition,
                      )}
                    />
                  </GameLayoutItem>
                )}
                {visible.has('answerComment') &&
                  game.question.answerComment && (
                    <GameLayoutItem id="answer-comment" layout={layout}>
                      <GameAnswerComment
                        className={stageMotionClass(
                          'answerComment',
                          game.currentStage,
                          game.transition,
                        )}
                      >
                        {game.question.answerComment}
                      </GameAnswerComment>
                    </GameLayoutItem>
                  )}
              </div>
              <div className="answer-slot">
                {visible.has('answer') && (
                  <>
                    {game.question.alternativeAnswers.length > 0 && (
                      <GameLayoutItem id="alternative-answer" layout={layout}>
                        <GameAlternativeAnswer
                          className={stageMotionClass(
                            'answer',
                            game.currentStage,
                            game.transition,
                          )}
                        >
                          {game.question.alternativeAnswers.join(' · ')}
                        </GameAlternativeAnswer>
                      </GameLayoutItem>
                    )}
                    <GameLayoutItem id="answer" layout={layout}>
                      <GameAnswer
                        answer={game.question.answer}
                        className={stageMotionClass(
                          'answer',
                          game.currentStage,
                          game.transition,
                        )}
                      />
                    </GameLayoutItem>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <GameLayoutItem id="controls" layout={layout}>
        <GameControls
          canGoBack={game.canGoBack}
          controlsDisabled={game.controlsDisabled}
          onBack={onBack}
          onNext={onNext}
        />
      </GameLayoutItem>
    </section>
  );
}
