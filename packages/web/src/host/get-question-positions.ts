import { type GameQuestion } from '@schdk/common';
import { type QuestionPosition } from './question-position';

export function getQuestionPositions(
  question: GameQuestion,
): QuestionPosition[] {
  const lastQuestionPartIndex = question.questionParts.length - 1;
  const positions: QuestionPosition[] = [
    { questionPartIndex: 0, stage: 'intro' },
    ...(question.handout
      ? [{ questionPartIndex: 0, stage: 'handout' } as const]
      : []),
  ];
  if (question.type === 'standard') {
    positions.push(
      { questionPartIndex: 0, stage: 'question' },
      { questionPartIndex: 0, stage: 'timer' },
      { questionPartIndex: 0, stage: 'timerReset' },
    );
  } else {
    question.questionParts.forEach((_, questionPartIndex) => {
      positions.push(
        { questionPartIndex, stage: 'timer' },
        { questionPartIndex, stage: 'timerReset' },
      );
    });
  }
  if (question.answerComment?.trim()) {
    positions.push({
      questionPartIndex: lastQuestionPartIndex,
      stage: 'answerComment',
    });
  }
  positions.push({ questionPartIndex: lastQuestionPartIndex, stage: 'answer' });
  return positions;
}
