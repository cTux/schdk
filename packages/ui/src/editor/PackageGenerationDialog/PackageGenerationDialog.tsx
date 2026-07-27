import '../QuestionGenerationDialog/styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { PackageGenerationDialogProps } from './types';

type Scope = 'missing' | 'all';

export function PackageGenerationDialog({
  apiKeyConfigured,
  templates,
  packages,
  gamePackage,
  onGenerate,
  onGenerated,
  onSelectQuestion,
}: PackageGenerationDialogProps) {
  const { copy } = useLocalization();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<Scope>('missing');
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const activePackages = packages.filter((item) => item.enabled);

  function reset() {
    setOpen(false);
    setScope('missing');
    setSelected(null);
    setThinking(false);
    setFailed(false);
    setProgress(null);
  }

  function show() {
    setSelected(activePackages.length ? 0 : null);
    setOpen(true);
  }

  async function generate() {
    const selectedPackage =
      selected === null ? undefined : activePackages[selected];
    const targets = gamePackage.questions.flatMap((question, index) =>
      scope === 'all' ||
      !question.answer.trim() ||
      question.questionParts.some((part) => !part.trim())
        ? [index]
        : [],
    );
    if (!selectedPackage || !templates.length || !targets.length) {
      return;
    }
    setThinking(true);
    setFailed(false);
    try {
      for (const [position, index] of targets.entries()) {
        setProgress([position + 1, targets.length]);
        onSelectQuestion(index);
        const additions = selectedPackage.questions.filter(
          (question) => question.questionNumber === index + 1,
        );
        const requestedType = additions.find(
          (question) => question.questionType,
        )?.questionType;
        const template =
          templates.find((item) => item.name === requestedType) ??
          templates[index % templates.length]!;
        const context = [`${selectedPackage.name}:\n${selectedPackage.context}`]
          .concat(additions.map((item) => item.context))
          .join('\n\n');
        onGenerated(index, await onGenerate(template, context));
      }
      reset();
    } catch {
      setThinking(false);
      setFailed(true);
    }
  }

  const targetsMissing = gamePackage.questions.some(
    (question) =>
      !question.answer.trim() ||
      question.questionParts.some((part) => !part.trim()),
  );

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
            <Dialog.Popup className="question-generation-popup">
              <Dialog.Title className="question-generation-title">
                {copy.packageGeneration.title}
              </Dialog.Title>
              <Dialog.Description className="question-generation-description">
                {copy.packageGeneration.description}
              </Dialog.Description>
              <label>
                {copy.packageGeneration.scope}
                <Dropdown
                  value={scope}
                  disabled={thinking}
                  onChange={(event) => setScope(event.target.value as Scope)}
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
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
