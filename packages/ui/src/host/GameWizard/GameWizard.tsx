import classNames from 'classnames';
import type { CustomGameElement, GameLayout } from '../../options/types';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';
import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameCustomElement,
  GameHandout,
  GameLogo,
  GameProgress,
  GameQuestion,
  GameQuestionParts,
  GameQuestionIntro,
  GameTimer,
} from '../GameElements';
import { GameMusicBreak } from '../GameMusicBreak';
import type { HostGameView } from '../types';
import { GameLayoutItem } from '../GameLayoutItem';
import { stageMotionClass } from './stage-motion';

export interface GameWizardProps {
  copy?: LocalizationCopy;
  customElements?: CustomGameElement[];
  game: HostGameView;
  layout: GameLayout | null;
  onBack(): void;
  onNext(): void;
}

export function GameWizard({
  copy = LOCALIZATION_COPY.uk,
  customElements = [],
  game,
  layout,
  onBack,
  onNext,
}: GameWizardProps) {
  const visible = new Set(game.visibleStages);
  const isIntro = game.currentStage === 'intro';
  const isMusicBreak = game.currentStage === 'musicBreak';
  const isHandoutFocus = game.currentStage === 'handout';
  const questionChangingClass = game.transition.questionChanging
    ? `is-${game.transition.phase}-${game.transition.direction}`
    : '';
  const customLayoutClass =
    layout && !isHandoutFocus ? 'has-custom-layout' : '';

  return (
    <section
      className={classNames('game-wizard', customLayoutClass)}
      aria-label={copy.host.game}
    >
      <GameLayoutItem id="logo" layout={layout}>
        <GameLogo />
      </GameLayoutItem>
      {!isMusicBreak && (
        <GameLayoutItem id="progress" layout={layout}>
          <GameProgress
            questionNumber={game.questionNumber}
            questionCount={game.questionCount}
          />
        </GameLayoutItem>
      )}
      <div
        className={classNames('game-wizard-canvas', {
          'is-handout-focus': isHandoutFocus,
        })}
      >
        {isMusicBreak && game.musicBreak ? (
          <GameMusicBreak
            musicBreak={game.musicBreak}
            volume={game.musicVolume}
          />
        ) : isIntro ? (
          <GameLayoutItem id="intro" layout={layout}>
            <GameQuestionIntro
              questionNumber={game.questionNumber}
              className={classNames(
                stageMotionClass('intro', game.currentStage, game.transition),
                questionChangingClass,
              )}
            />
          </GameLayoutItem>
        ) : (
          <div className={classNames('question-board', questionChangingClass)}>
            <div className="question-board-top">
              <div className="handout-slot">
                {visible.has('handout') && game.question.handout && (
                  <GameLayoutItem id="handout" layout={layout}>
                    <GameHandout
                      copy={copy}
                      handout={game.question.handout}
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
                      className={
                        game.question.type === 'standard'
                          ? stageMotionClass(
                              'question',
                              game.currentStage,
                              game.transition,
                            )
                          : undefined
                      }
                    >
                      <GameQuestionParts
                        currentPartIndex={game.currentQuestionPartIndex}
                        entering={
                          game.question.type !== 'standard' &&
                          game.transition.phase === 'enter'
                        }
                        parts={game.question.questionParts}
                      />
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
                    {(game.question.alternativeAnswers.length > 0 ||
                      game.question.wrongAnswers.length > 0) && (
                      <GameLayoutItem id="alternative-answer" layout={layout}>
                        <GameAlternativeAnswer
                          className={stageMotionClass(
                            'answer',
                            game.currentStage,
                            game.transition,
                          )}
                        >
                          {game.question.alternativeAnswers.join(' · ')}
                          {game.question.alternativeAnswers.length > 0 &&
                            game.question.wrongAnswers.length > 0 &&
                            ' · '}
                          {game.question.wrongAnswers.length > 0 && (
                            <span
                              className="game-wrong-answer"
                              aria-label={`${copy.editor.wrongAnswers}: ${game.question.wrongAnswers.join(' · ')}`}
                            >
                              {game.question.wrongAnswers.join(' · ')}
                            </span>
                          )}
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
      {customElements.map((element) => (
        <GameCustomElement element={element} key={element.id} />
      ))}
      <GameLayoutItem id="controls" layout={layout}>
        <GameControls
          copy={copy}
          canGoBack={game.canGoBack}
          controlsDisabled={game.controlsDisabled}
          onBack={onBack}
          onNext={onNext}
        />
      </GameLayoutItem>
    </section>
  );
}
