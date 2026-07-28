import {
  getGameQuestionAnswers,
  type AIQuestion,
  type AIQuestionsPackage,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';

export type PackageGenerationScope = 'missing' | 'commented' | 'all';
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
    (scope === 'commented'
      ? Boolean(question.comment?.trim())
      : !question.answer.trim() ||
        question.questionParts.some((part) => !part.trim()))
      ? [index]
      : [],
  );
}

function getPackageGenerationExcludedAnswers(
  gamePackage: GamePackage,
  targets: number[],
) {
  return gamePackage.questions.flatMap((question, index) =>
    targets.includes(index) ? [] : getGameQuestionAnswers(question),
  );
}

export function getPackageGenerationState(
  gamePackage: GamePackage,
  scope: PackageGenerationScope,
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  ruleSet: PackageGenerationRuleSet,
  progress: [number, number] | null,
  currentInput: PackageGenerationInput | null,
) {
  const targets = getPackageGenerationTargets(gamePackage, scope);
  const previewIndex = targets[progress ? progress[0] - 1 : 0];
  return {
    targets,
    initialExcludedAnswers: getPackageGenerationExcludedAnswers(
      gamePackage,
      targets,
    ),
    previewInput:
      currentInput ??
      getPackageGenerationPreviewInput(
        selectedPackage,
        templates,
        previewIndex,
        ruleSet,
        scope === 'commented' && previewIndex !== undefined
          ? gamePackage.questions[previewIndex]
          : undefined,
      ),
  };
}

export function getPackageGenerationInput(
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  index: number,
  ruleSet: PackageGenerationRuleSet = 'all',
  currentQuestion?: GameQuestion,
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
      .concat(
        currentQuestion?.comment?.trim()
          ? [
              `Existing question to revise:\n${JSON.stringify(currentQuestion)}\n\nAuthor remark that must be resolved:\n${currentQuestion.comment.trim()}`,
            ]
          : [],
      )
      .join('\n\n'),
  };
}

export function getPackageGenerationPreviewInput(
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  index: number | undefined,
  ruleSet: PackageGenerationRuleSet,
  currentQuestion?: GameQuestion,
) {
  return index === undefined
    ? null
    : getPackageGenerationInput(
        selectedPackage,
        templates,
        index,
        ruleSet,
        currentQuestion,
        () => 0,
      );
}
