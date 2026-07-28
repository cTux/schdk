import {
  AI_QUESTION_DIFFICULTIES,
  type AIQuestionDifficulty,
} from '@schdk/common';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { useLocalization } from '../../localization';
import type { PackageGenerationRuleSet } from '../PackageGenerationDialog/generation-input';
import { QuestionDatabaseCheck } from '../QuestionDatabaseCheck';
import type { PackageGenerationOptionsProps } from './types';

import './styles.scss';

export function PackageGenerationOptions({
  activePackages,
  canGenerate,
  difficulty,
  hasRandomTemplates,
  progress,
  ruleSet,
  scope,
  selected,
  hasTargets,
  thinking,
  checkQuestionDatabase,
  onCheckQuestionDatabaseChange,
  onCancel,
  onDifficultyChange,
  onPackageChange,
  onRuleSetChange,
  onScopeChange,
  onGenerate,
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
          <option value="commented">{copy.packageGeneration.commented}</option>
          <option value="all">{copy.packageGeneration.all}</option>
        </Dropdown>
      </label>
      <label>
        {copy.questionGeneration.difficulty}
        <Dropdown
          value={difficulty}
          disabled={thinking}
          onChange={(event) =>
            onDifficultyChange(event.target.value as AIQuestionDifficulty)
          }
        >
          {AI_QUESTION_DIFFICULTIES.map((value) => (
            <option key={value} value={value}>
              {copy.questionGeneration.difficulties[value]}
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
      <QuestionDatabaseCheck
        checked={checkQuestionDatabase}
        disabled={thinking}
        label={copy.packageGeneration.checkDatabase}
        onChange={onCheckQuestionDatabaseChange}
      />
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
          disabled={thinking || !canGenerate}
          onClick={onGenerate}
        >
          {copy.packageGeneration.generate}
        </Button>
      </div>
    </>
  );
}
