import { Dropdown } from '../../atoms/Dropdown';
import { useLocalization } from '../../localization';
import type { PackageGenerationRuleSet } from '../PackageGenerationDialog/generation-input';
import type { PackageGenerationOptionsProps } from './types';

export function PackageGenerationOptions({
  activePackages,
  hasRandomTemplates,
  ruleSet,
  scope,
  selected,
  targetsMissing,
  thinking,
  onPackageChange,
  onRuleSetChange,
  onScopeChange,
}: PackageGenerationOptionsProps) {
  const { copy } = useLocalization();
  return (
    <>
      <label>
        {copy.packageGeneration.scope}
        <Dropdown
          value={scope}
          disabled={thinking}
          onChange={(event) =>
            onScopeChange(event.target.value as typeof scope)
          }
        >
          <option value="missing">{copy.packageGeneration.missing}</option>
          <option value="all">{copy.packageGeneration.all}</option>
        </Dropdown>
      </label>
      {activePackages.length ? (
        <label>
          {copy.packageGeneration.rules}
          <Dropdown
            value={selected ?? ''}
            disabled={thinking}
            onChange={(event) => onPackageChange(Number(event.target.value))}
          >
            {activePackages.map((item, index) => (
              <option key={`${item.name}-${index}`} value={index}>
                {item.favorite ? '⭐ ' : ''}
                {item.name}
              </option>
            ))}
          </Dropdown>
        </label>
      ) : (
        <p className="question-generation-message">
          {copy.packageGeneration.noRules}
        </p>
      )}
      <label>
        {copy.packageGeneration.ruleSet}
        <Dropdown
          value={ruleSet}
          disabled={thinking}
          onChange={(event) =>
            onRuleSetChange(event.target.value as PackageGenerationRuleSet)
          }
        >
          <option value="all">{copy.packageGeneration.ruleSets.all}</option>
          <option value="favorites">
            {copy.packageGeneration.ruleSets.favorites}
          </option>
          <option value="non-favorites">
            {copy.packageGeneration.ruleSets.nonFavorites}
          </option>
        </Dropdown>
      </label>
      {!hasRandomTemplates && (
        <p className="question-generation-message">
          {copy.packageGeneration.noTemplates}
        </p>
      )}
      {scope === 'missing' && !targetsMissing && (
        <p className="question-generation-message">
          {copy.packageGeneration.nothingMissing}
        </p>
      )}
    </>
  );
}
