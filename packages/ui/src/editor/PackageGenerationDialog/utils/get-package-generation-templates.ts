import { type AIQuestion } from '@schdk/common';
import { type PackageGenerationRuleSet } from '../types/package-generation-rule-set';

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
