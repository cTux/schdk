import { getGameQuestionAnswers, type GameQuestion } from '@schdk/common';
import type { ExistingQuestionReference } from './game-question-prompt.js';

function normalize(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
}

function tokens(value: string) {
  return new Set(
    normalize(value)
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((token) => token.length > 2),
  );
}

function scoreReference(
  question: GameQuestion,
  reference: ExistingQuestionReference,
) {
  const generatedText = normalize(question.questionParts.join(' '));
  const referenceText = normalize(reference.question);
  const generatedAnswers = getGameQuestionAnswers(question).map(normalize);
  const referenceAnswers = reference.answers.map(normalize);
  if (generatedAnswers.some((answer) => referenceAnswers.includes(answer))) {
    return 4;
  }
  if (
    generatedText &&
    referenceText &&
    (generatedText.includes(referenceText) ||
      referenceText.includes(generatedText))
  ) {
    return 3;
  }
  const generatedTokens = tokens(
    `${generatedText} ${generatedAnswers.join(' ')}`,
  );
  const referenceTokens = tokens(
    `${referenceText} ${referenceAnswers.join(' ')}`,
  );
  let overlap = 0;
  for (const token of generatedTokens) {
    if (referenceTokens.has(token)) overlap += 1;
  }
  return overlap / Math.sqrt(generatedTokens.size * referenceTokens.size || 1);
}

export function findSimilarQuestionCandidates(
  question: GameQuestion,
  references: ExistingQuestionReference[],
) {
  return references
    .map((reference) => ({
      reference,
      score: scoreReference(question, reference),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 20)
    .map((item) => item.reference);
}
