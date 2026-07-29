import {
  type AIQuestion,
  type AIQuestionsPackage,
  type GameQuestion,
} from '@schdk/common';
import { type PackageGenerationRuleSet } from './package-generation-rule-set';
import { type PackageGenerationInput } from './package-generation-input';
import { getPackageGenerationTemplates } from './generation-input';

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
