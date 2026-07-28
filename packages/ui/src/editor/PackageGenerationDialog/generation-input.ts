import type {
  AIQuestion,
  AIQuestionsPackage,
  GamePackage,
} from '@schdk/common';

export type PackageGenerationScope = 'missing' | 'all';

export function getPackageGenerationTargets(
  gamePackage: GamePackage,
  scope: PackageGenerationScope,
) {
  return gamePackage.questions.flatMap((question, index) =>
    scope === 'all' ||
    !question.answer.trim() ||
    question.questionParts.some((part) => !part.trim())
      ? [index]
      : [],
  );
}

export function getPackageGenerationInput(
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  index: number,
) {
  if (!selectedPackage || !templates.length) return null;
  const additions = selectedPackage.questions.filter(
    (question) => question.questionNumber === index + 1,
  );
  const requestedType = additions.find(
    (question) => question.questionType,
  )?.questionType;
  return {
    template:
      templates.find((item) => item.name === requestedType) ??
      templates[index % templates.length]!,
    context: [`${selectedPackage.name}:\n${selectedPackage.context}`]
      .concat(additions.map((item) => item.context))
      .join('\n\n'),
  };
}
