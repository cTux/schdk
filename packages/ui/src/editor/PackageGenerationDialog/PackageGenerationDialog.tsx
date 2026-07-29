import '../QuestionGenerationDialog/styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import * as common from '@schdk/common';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../../atoms/ConfirmationDialog';
import { IconButton } from '../../atoms/IconButton';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import { PackageGenerationOpenButton } from '../PackageGenerationOpenButton';
import { PackageGenerationOptions } from '../PackageGenerationOptions';
import * as gen from './generation-input';
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
  const cancelDialog = useConfirmationDialog();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<gen.PackageGenerationScope>('missing');
  const [ruleSet, setRuleSet] = useState<gen.PackageGenerationRuleSet>('all');
  const [difficulty, setDifficulty] =
    useState<common.AIQuestionDifficulty>('medium');
  const [recognizability, setRecognizability] =
    useState<common.AIQuestionRecognizability>('medium');
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [excludedAnswers, setExcludedAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] =
    useState<gen.PackageGenerationInput | null>(null);
  const [checkQuestionDatabase, setCheckQuestionDatabase] = useState(false);
  const generationId = useRef(0);
  const activePackages = packages
    .filter((item) => item.enabled)
    .sort(common.compareFavoriteItemsByName);
  const randomTemplates = gen.getPackageGenerationTemplates(templates, ruleSet);
  const selectedPackage =
    selected === null ? undefined : activePackages[selected];
  const { targets, initialExcludedAnswers, previewInput } =
    gen.getPackageGenerationState(
      gamePackage,
      scope,
      selectedPackage,
      templates,
      ruleSet,
      progress,
      currentInput,
    );
  function reset() {
    generationId.current += 1;
    setOpen(false);
    setScope('missing');
    setRuleSet('all');
    setDifficulty('medium');
    setRecognizability('medium');
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
  async function cancel() {
    const confirmed = await cancelDialog.confirm(
      copy.packageGeneration.cancelConfirmation,
    );
    if (confirmed) reset();
  }
  async function generate() {
    if (!selectedPackage || !randomTemplates.length || !targets.length) return;
    const currentGenerationId = ++generationId.current;
    setThinking(true);
    setFailed(false);
    try {
      await onGenerationStart?.(checkQuestionDatabase);
      if (currentGenerationId !== generationId.current) return;
      const usedAnswers = [...initialExcludedAnswers];
      for (const [position, index] of targets.entries()) {
        const input = gen.getPackageGenerationInput(
          selectedPackage,
          templates,
          index,
          ruleSet,
          scope === 'commented' ? gamePackage.questions[index] : undefined,
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
          difficulty,
          checkQuestionDatabase,
          recognizability,
        );
        if (currentGenerationId !== generationId.current) return;
        const generatedQuestion =
          scope === 'commented'
            ? { ...question, comment: undefined }
            : question;
        onGenerated(index, generatedQuestion);
        usedAnswers.push(...common.getGameQuestionAnswers(question));
      }
      reset();
    } catch {
      if (currentGenerationId !== generationId.current) return;
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
                    canGenerate={
                      selected !== null &&
                      Boolean(randomTemplates.length) &&
                      Boolean(targets.length)
                    }
                    difficulty={difficulty}
                    recognizability={recognizability}
                    hasRandomTemplates={Boolean(randomTemplates.length)}
                    progress={progress}
                    ruleSet={ruleSet}
                    scope={scope}
                    selected={selected}
                    hasTargets={Boolean(targets.length)}
                    thinking={thinking}
                    checkQuestionDatabase={checkQuestionDatabase}
                    onCheckQuestionDatabaseChange={setCheckQuestionDatabase}
                    onCancel={() => void cancel()}
                    onDifficultyChange={setDifficulty}
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
                        difficulty,
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
      <ConfirmationDialog {...cancelDialog.dialogProps} />
    </>
  );
}
