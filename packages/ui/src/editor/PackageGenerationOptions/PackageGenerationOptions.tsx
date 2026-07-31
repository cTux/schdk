import type { AIQuestionRecognizability } from '@schdk/common';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import type { PackageGenerationRuleSet } from '../PackageGenerationDialog/utils/generation-input';
import type { PackageGenerationOptionsProps } from './types';

import './styles.scss';

export function PackageGenerationOptions({
  activePackages,
  canGenerate,
  difficultyDistribution,
  recognizability,
  difficulties,
  recognizabilities,
  hasRandomTemplates,
  progress,
  ruleSet,
  scope,
  selected,
  hasTargets,
  thinking,
  onCancel,
  onDifficultyPercentageChange,
  onRecognizabilityChange,
  onPackageChange,
  onRuleSetChange,
  onScopeChange,
  onGenerate,
}: PackageGenerationOptionsProps) {
  const { copy } = useLocalization();
  const difficultyTotal = Object.values(difficultyDistribution).reduce(
    (total, percentage) => total + percentage,
    0,
  );
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
          <option value="commented">{copy.packageGeneration.commented}</option>
          <option value="all">{copy.packageGeneration.all}</option>
        </Dropdown>
      </label>
      <fieldset className="package-generation-difficulties">
        <legend>{copy.packageGeneration.difficultyDistribution}</legend>
        <div className="package-generation-difficulty-list">
          {difficulties.map((item) => (
            <label key={item.value}>
              <span>{item.name}</span>
              <span className="package-generation-percentage">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={difficultyDistribution[item.value]}
                  disabled={thinking}
                  onChange={(event) =>
                    onDifficultyPercentageChange(
                      item.value,
                      Math.min(
                        100,
                        Math.max(0, event.target.valueAsNumber || 0),
                      ),
                    )
                  }
                />
                %
              </span>
            </label>
          ))}
        </div>
        <p
          className={
            difficultyTotal === 100
              ? 'package-generation-difficulty-total'
              : 'package-generation-difficulty-total question-generation-error'
          }
        >
          {copy.packageGeneration.difficultyTotal(difficultyTotal)}
        </p>
      </fieldset>
      <label>
        {copy.questionGeneration.recognizability}
        <Dropdown
          value={recognizability}
          disabled={thinking}
          onChange={(event) =>
            onRecognizabilityChange(
              event.target.value as AIQuestionRecognizability,
            )
          }
        >
          {recognizabilities.map((item) => (
            <option key={item.value} value={item.value}>
              {item.name}
            </option>
          ))}
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
      {scope !== 'all' && !hasTargets && (
        <p className="question-generation-message">
          {scope === 'missing'
            ? copy.packageGeneration.nothingMissing
            : copy.packageGeneration.nothingCommented}
        </p>
      )}
      {progress && (
        <div className="question-generation-progress" role="status">
          <span>{copy.packageGeneration.progress(...progress)}</span>
          <strong>{Math.round((progress[0] / progress[1]) * 100)}%</strong>
          <progress
            aria-label={copy.packageGeneration.progress(...progress)}
            max={progress[1]}
            value={progress[0]}
          />
        </div>
      )}
      <div className="question-generation-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {copy.packageGeneration.cancel}
        </Button>
        <Button
          type="button"
          variant="primary"
          aria-busy={thinking}
          disabled={thinking || !canGenerate || difficultyTotal !== 100}
          onClick={onGenerate}
        >
          {copy.packageGeneration.generate}
        </Button>
      </div>
    </>
  );
}
