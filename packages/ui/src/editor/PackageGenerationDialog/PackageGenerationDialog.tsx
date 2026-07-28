import '../QuestionGenerationDialog/styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  compareFavoriteItemsByName,
  getGameQuestionAnswers,
} from '@schdk/common';
import classNames from 'classnames';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import { PackageGenerationOpenButton } from '../PackageGenerationOpenButton';
import { PackageGenerationOptions } from '../PackageGenerationOptions';
import {
  getPackageGenerationInput,
  getPackageGenerationPreviewInput,
  getPackageGenerationTemplates,
  getPackageGenerationTargets,
  type PackageGenerationInput,
  type PackageGenerationRuleSet,
  type PackageGenerationScope,
} from './generation-input';
import type { PackageGenerationDialogProps } from './types';

export function PackageGenerationDialog({
  apiKeyConfigured,
  templates,
  packages,
  gamePackage,
  onGenerationStart,
  getPromptPreview,
  onGenerate,
  onGenerated,
  onSelectQuestion,
}: PackageGenerationDialogProps) {
  const { copy } = useLocalization();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<PackageGenerationScope>('missing');
  const [ruleSet, setRuleSet] = useState<PackageGenerationRuleSet>('all');
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [excludedAnswers, setExcludedAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] =
    useState<PackageGenerationInput | null>(null);
  const [checkQuestionDatabase, setCheckQuestionDatabase] = useState(false);
  const activePackages = packages
    .filter((item) => item.enabled)
    .sort(compareFavoriteItemsByName);
  const randomTemplates = getPackageGenerationTemplates(templates, ruleSet);
  const selectedPackage =
    selected === null ? undefined : activePackages[selected];
  const missingTargets = getPackageGenerationTargets(gamePackage, 'missing');
  const targets =
    scope === 'missing'
      ? missingTargets
      : getPackageGenerationTargets(gamePackage, scope);
  const initialExcludedAnswers = gamePackage.questions.flatMap(
    (question, index) =>
      targets.includes(index) ? [] : getGameQuestionAnswers(question),
  );
  function reset() {
    setOpen(false);
    setScope('missing');
    setRuleSet('all');
    setSelected(null);
    setThinking(false);
    setFailed(false);
    setProgress(null);
    setPromptOpen(false);
    setExcludedAnswers([]);
    setCurrentInput(null);
    setCheckQuestionDatabase(false);
  }

  function show() {
    setSelected(activePackages.length ? 0 : null);
    setOpen(true);
  }
  const targetsMissing = Boolean(missingTargets.length);
  const previewIndex = targets[progress ? progress[0] - 1 : 0];
  const previewInput =
    currentInput ??
    getPackageGenerationPreviewInput(
      selectedPackage,
      templates,
      previewIndex,
      ruleSet,
    );
  async function generate() {
    if (!selectedPackage || !randomTemplates.length || !targets.length) return;
    setThinking(true);
    setFailed(false);
    try {
      await onGenerationStart?.(checkQuestionDatabase);
      const usedAnswers = [...initialExcludedAnswers];
      for (const [position, index] of targets.entries()) {
        const input = getPackageGenerationInput(
          selectedPackage,
          templates,
          index,
          ruleSet,
        );
        if (!input) throw new Error('Missing generation input');
        setCurrentInput(input);
        setProgress([position + 1, targets.length]);
        setExcludedAnswers([...usedAnswers]);
        onSelectQuestion(index);
        const question = await onGenerate(
          input.template,
          input.context,
          usedAnswers,
          undefined,
          checkQuestionDatabase,
        );
        onGenerated(index, question);
        usedAnswers.push(...getGameQuestionAnswers(question));
      }
      reset();
    } catch {
      setThinking(false);
      setFailed(true);
    }
  }

  return (
    <>
      <PackageGenerationOpenButton
        apiKeyConfigured={apiKeyConfigured}
        onClick={show}
      />
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (thinking) return;
          if (nextOpen) show();
          else reset();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="question-generation-backdrop" />
          <Dialog.Viewport className="question-generation-viewport">
            <Dialog.Popup
              className={classNames('question-generation-popup', {
                'question-generation-popup-prompt': promptOpen,
              })}
            >
              <div className="question-generation-title-row">
                <Dialog.Title className="question-generation-title">
                  {copy.packageGeneration.title}
                </Dialog.Title>
                {getPromptPreview && (
                  <IconButton
                    icon={promptOpen ? faChevronLeft : faChevronRight}
                    label={
                      promptOpen
                        ? copy.questionGeneration.hidePrompt
                        : copy.questionGeneration.showPrompt
                    }
                    onClick={() => setPromptOpen((value) => !value)}
                  />
                )}
              </div>
              <div className="question-generation-body">
                <div className="question-generation-form">
                  <Dialog.Description className="question-generation-description">
                    {copy.packageGeneration.description}
                  </Dialog.Description>
                  <PackageGenerationOptions
                    activePackages={activePackages}
                    hasRandomTemplates={Boolean(randomTemplates.length)}
                    ruleSet={ruleSet}
                    scope={scope}
                    selected={selected}
                    targetsMissing={targetsMissing}
                    thinking={thinking}
                    checkQuestionDatabase={checkQuestionDatabase}
                    onCheckQuestionDatabaseChange={setCheckQuestionDatabase}
                    onPackageChange={(index) => {
                      setSelected(index);
                      setCurrentInput(null);
                    }}
                    onRuleSetChange={(nextRuleSet) => {
                      setRuleSet(nextRuleSet);
                      setCurrentInput(null);
                    }}
                    onScopeChange={(nextScope) => {
                      setScope(nextScope);
                      setCurrentInput(null);
                    }}
                  />
                  {progress && (
                    <p className="question-generation-message" role="status">
                      {copy.packageGeneration.progress(...progress)}
                    </p>
                  )}
                  {failed && (
                    <p className="question-generation-error" role="alert">
                      {copy.packageGeneration.failed}
                    </p>
                  )}
                  <div className="question-generation-actions">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={thinking}
                      onClick={reset}
                    >
                      {copy.shared.cancel}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      aria-busy={thinking}
                      disabled={
                        thinking ||
                        selected === null ||
                        !randomTemplates.length ||
                        (scope === 'missing' && !targetsMissing)
                      }
                      onClick={() => void generate()}
                    >
                      {copy.packageGeneration.generate}
                    </Button>
                  </div>
                </div>
                {promptOpen && previewInput && getPromptPreview && (
                  <label className="question-generation-prompt">
                    {copy.questionGeneration.prompt}
                    <Textarea
                      readOnly
                      value={getPromptPreview(
                        previewInput.template,
                        previewInput.context,
                        progress ? excludedAnswers : initialExcludedAnswers,
                      )}
                    />
                  </label>
                )}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
