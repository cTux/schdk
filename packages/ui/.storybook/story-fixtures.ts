import { createEmptyGamePackage } from '@schdk/common';
import { gameQuestion } from './game-question';
import { aiQuestion } from './ai-question';
import { questionDatabaseRows } from './question-database-rows';
import { position } from './position';
import { customElement } from './custom-element';
import { aiOptions } from './ai-options';
import { recent } from './recent';
import { noop } from './noop';
import { confirm } from './confirm';
import { componentValues } from './component-values';

const gamePackage = createEmptyGamePackage();
gamePackage.questions[1] = gameQuestion;

export {
  gamePackage,
  gameQuestion,
  aiQuestion,
  questionDatabaseRows,
  position,
  customElement,
  aiOptions,
  recent,
  noop,
  confirm,
  componentValues,
};
