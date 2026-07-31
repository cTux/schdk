import '../QuestionGenerationDialog/styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { ConfirmationDialog } from '../../atoms/ConfirmationDialog';
import { IconButton } from '../../atoms/IconButton';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import { PackageGenerationOpenButton } from '../PackageGenerationOpenButton';
import { PackageGenerationOptions } from '../PackageGenerationOptions';
import { dockedGenerationViewportClassName } from '../docked-generation-viewport-class-name';
import type { PackageGenerationDialogProps } from './types';
import { usePackageGeneration } from './hooks/use-package-generation';

export function PackageGenerationDialog({
  apiKeyConfigured,
  templates,
  difficulties,
  recognizabilities,
  packages,
  gamePackage,
  onGenerationStart,
  getPromptPreview,
  onGenerate,
  onGenerated,
  onGenerationStateChange,
  onSelectQuestion,
}: PackageGenerationDialogProps) {
  const { copy } = useLocalization();
  const generation = usePackageGeneration({
    apiKeyConfigured,
    templates,
    packages,
    difficulties,
    recognizabilities,
    gamePackage,
    onGenerationStart,
    getPromptPreview,
    onGenerate,
    onGenerated,
    onGenerationStateChange,
    onSelectQuestion,
  });
  const {
    activePackages,
    cancel,
    currentDifficulty,
    difficultyDistribution,
    excludedAnswers,
    failed,
    generate,
    initialExcludedAnswers,
    open,
    previewInput,
    progress,
    promptOpen,
    randomTemplates,
    recognizability,
    reset,
    ruleSet,
    scope,
    selected,
    setCurrentInput,
    setDifficultyDistribution,
    setPromptOpen,
    setRecognizability,
    setRuleSet,
    setScope,
    setSelected,
    show,
    targets,
    thinking,
  } = generation;

  return (
    <>
      <PackageGenerationOpenButton
        apiKeyConfigured={apiKeyConfigured}
        onClick={show}
      />
      <Dialog.Root
        modal={false}
        disablePointerDismissal
        open={open}
        onOpenChange={(nextOpen) => {
          if (thinking) return;
          if (nextOpen) show();
          else reset();
        }}
      >
        <Dialog.Portal>
          <Dialog.Viewport className={dockedGenerationViewportClassName}>
            <Dialog.Popup
              className={classNames(
                'question-generation-popup question-generation-popup-docked',
                {
                  'question-generation-popup-prompt': promptOpen,
                },
              )}
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
                    canGenerate={
                      selected !== null &&
                      Boolean(randomTemplates.length) &&
                      Boolean(targets.length)
                    }
                    difficultyDistribution={difficultyDistribution}
                    recognizability={recognizability}
                    difficulties={difficulties}
                    recognizabilities={recognizabilities}
                    hasRandomTemplates={Boolean(randomTemplates.length)}
                    progress={progress}
                    ruleSet={ruleSet}
                    scope={scope}
                    selected={selected}
                    hasTargets={Boolean(targets.length)}
                    thinking={thinking}
                    onCancel={() => void cancel()}
                    onDifficultyPercentageChange={(difficulty, percentage) => {
                      setDifficultyDistribution((current) => ({
                        ...current,
                        [difficulty]: percentage,
                      }));
                      setCurrentInput(null);
                    }}
                    onRecognizabilityChange={setRecognizability}
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
                    onGenerate={() => void generate()}
                  />
                  {failed && (
                    <p className="question-generation-error" role="alert">
                      {copy.packageGeneration.failed}
                    </p>
                  )}
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
                        currentDifficulty,
                        recognizability,
                      )}
                    />
                  </label>
                )}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmationDialog {...generation.cancelDialogProps} />
    </>
  );
}
