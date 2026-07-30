import { createEmptyGamePackage } from '@schdk/common';
import { gameQuestion } from './game-question';

const gamePackage = createEmptyGamePackage();
gamePackage.questions[1] = gameQuestion;
gamePackage.questions[2] = { ...gameQuestion };

export { gamePackage };
