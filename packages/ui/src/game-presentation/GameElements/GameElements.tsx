import { AppIcon } from '../../atoms/AppIcon';
import { type ElementProps } from './element-props';
import { GameProgress } from '../GameProgress';
import { GameQuestionIntro } from '../GameQuestionIntro';
import { GameHandout } from '../GameHandout';
import { GameQuestion } from '../GameQuestion';
import { GameQuestionParts } from '../GameQuestionParts';
import { GameTimer } from '../GameTimer';
import { GameAnswerComment } from '../GameAnswerComment';
import { GameAnswer } from '../GameAnswer';
import { GameAlternativeAnswer } from '../GameAlternativeAnswer';
import { GameCustomElement } from '../GameCustomElement';
import { GameControls } from '../GameControls';

function GameLogo() {
  return <AppIcon className="game-logo" />;
}

export {
  type ElementProps,
  GameLogo,
  GameProgress,
  GameQuestionIntro,
  GameHandout,
  GameQuestion,
  GameQuestionParts,
  GameTimer,
  GameAnswerComment,
  GameAnswer,
  GameAlternativeAnswer,
  GameCustomElement,
  GameControls,
};
