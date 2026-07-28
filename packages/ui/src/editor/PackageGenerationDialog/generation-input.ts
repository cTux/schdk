import type {
  AIQuestion,
  AIQuestionsPackage,
  GamePackage,
} from '@schdk/common';

export type PackageGenerationScope = 'missing' | 'all';
export type PackageGenerationRuleSet = 'all' | 'favorites' | 'non-favorites';
export interface PackageGenerationInput {
  template: AIQuestion;
  context: string;
}

export function getPackageGenerationTemplates(
  templates: AIQuestion[],
  ruleSet: PackageGenerationRuleSet,
) {
  return templates.filter(
    (template) =>
      template.enabled &&
      !template.generalRule &&
      (ruleSet === 'all' || template.favorite === (ruleSet === 'favorites')),
  );
}

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
  ruleSet: PackageGenerationRuleSet = 'all',
  random = Math.random,
): PackageGenerationInput | null {
  const randomTemplates = getPackageGenerationTemplates(templates, ruleSet);
  if (!selectedPackage || !randomTemplates.length) return null;
  const additions = selectedPackage.questions.filter(
    (question) => question.questionNumber === index + 1,
  );
  const requestedType = additions.find(
    (question) => question.questionType,
  )?.questionType;
  return {
    template:
      templates.find(
        (item) =>
          item.enabled && !item.generalRule && item.name === requestedType,
      ) ?? randomTemplates[Math.floor(random() * randomTemplates.length)]!,
    context: [`${selectedPackage.name}:\n${selectedPackage.context}`]
      .concat(additions.map((item) => item.context))
      .join('\n\n'),
  };
}

export function getPackageGenerationPreviewInput(
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  index: number | undefined,
  ruleSet: PackageGenerationRuleSet,
) {
  return index === undefined
    ? null
    : getPackageGenerationInput(
        selectedPackage,
        templates,
        index,
        ruleSet,
        () => 0,
      );
}
