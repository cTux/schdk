import { type AIQuestion } from '@schdk/common';
import { type PackageGenerationRuleSet } from '../types/package-generation-rule-set';
import { type PackageGenerationScope } from '../types/package-generation-scope';
import { type PackageGenerationInput } from '../types/package-generation-input';
import { getPackageGenerationTargets } from './get-package-generation-targets';
import { getPackageGenerationState } from './get-package-generation-state';
import { getPackageGenerationInput } from './get-package-generation-input';
import { getPackageGenerationPreviewInput } from './get-package-generation-preview-input';

function getPackageGenerationTemplates(
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

export {
  type PackageGenerationScope,
  type PackageGenerationRuleSet,
  type PackageGenerationInput,
  getPackageGenerationTemplates,
  getPackageGenerationTargets,
  getPackageGenerationState,
  getPackageGenerationInput,
  getPackageGenerationPreviewInput,
};
