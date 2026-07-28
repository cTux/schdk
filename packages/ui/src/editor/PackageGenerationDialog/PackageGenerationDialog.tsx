import '../QuestionGenerationDialog/styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { getGameQuestionAnswers } from '@schdk/common';
import classNames from 'classnames';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { IconButton } from '../../atoms/IconButton';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import {
  getPackageGenerationInput,
  getPackageGenerationTargets,
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
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [excludedAnswers, setExcludedAnswers] = useState<string[]>([]);
  const activePackages = packages.filter((item) => item.enabled);
  const selectedPackage =
    selected === null ? undefined : activePackages[selected];
  const targets = getPackageGenerationTargets(gamePackage, scope);
  const initialExcludedAnswers = gamePackage.questions.flatMap(
    (question, index) =>
      targets.includes(index) ? [] : getGameQuestionAnswers(question),
  );
  function reset() {
    setOpen(false);
    setScope('missing');
    setSelected(null);
    setThinking(false);
    setFailed(false);
    setProgress(null);
    setPromptOpen(false);
    setExcludedAnswers([]);
  }

  function show() {
    setSelected(activePackages.length ? 0 : null);
    setOpen(true);
  }
  const targetsMissing = gamePackage.questions.some(
    (question) =>
      !question.answer.trim() ||
      question.questionParts.some((part) => !part.trim()),
  );
  const previewIndex = targets[progress ? progress[0] - 1 : 0];
  const previewInput =
    previewIndex === undefined
      ? null
      : getPackageGenerationInput(selectedPackage, templates, previewIndex);
  async function generate() {
    if (!selectedPackage || !templates.length || !targets.length) return;
    setThinking(true);
    setFailed(false);
    try {
      await onGenerationStart?.();
      const usedAnswers = [...initialExcludedAnswers];
      for (const [position, index] of targets.entries()) {
        const input = getPackageGenerationInput(
          selectedPackage,
          templates,
          index,
        );
        if (!input) throw new Error('Missing generation input');
        setProgress([position + 1, targets.length]);
        setExcludedAnswers([...usedAnswers]);
        onSelectQuestion(index);
        const question = await onGenerate(
          input.template,
          input.context,
          usedAnswers,
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
      <IconButton
        icon={faWandMagicSparkles}
        label={copy.packageGeneration.open}
        tooltipLabel={
          apiKeyConfigured
            ? copy.packageGeneration.open
            : copy.questionGeneration.apiKeyMissing
        }
        disabled={!apiKeyConfigured}
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
                  <label>
                    {copy.packageGeneration.scope}
                    <Dropdown
                      value={scope}
                      disabled={thinking}
                      onChange={(event) =>
                        setScope(event.target.value as PackageGenerationScope)
                      }
                    >
                      <option value="missing">
                        {copy.packageGeneration.missing}
                      </option>
                      <option value="all">{copy.packageGeneration.all}</option>
                    </Dropdown>
                  </label>
                  {activePackages.length ? (
                    <label>
                      {copy.packageGeneration.rules}
                      <Dropdown
                        value={selected ?? ''}
                        disabled={thinking}
                        onChange={(event) =>
                          setSelected(Number(event.target.value))
                        }
                      >
                        {activePackages.map((item, index) => (
                          <option key={`${item.name}-${index}`} value={index}>
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
                  {scope === 'missing' && !targetsMissing && (
                    <p className="question-generation-message">
                      {copy.packageGeneration.nothingMissing}
                    </p>
                  )}
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
                        !templates.length ||
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
