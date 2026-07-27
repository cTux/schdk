import './styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
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
  const [selected, setSelected] = useState<number[]>([]);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const activePackages = packages.filter((item) => item.enabled);

  function reset() {
    setOpen(false);
    setScope('missing');
    setSelected([]);
    setThinking(false);
    setFailed(false);
    setProgress(null);
  }

  function show() {
    setSelected(activePackages.map((_, index) => index));
    setOpen(true);
  }

  async function generate() {
    const selectedPackages = selected.flatMap((index) =>
      activePackages[index] ? [activePackages[index]] : [],
    );
    const targets = gamePackage.questions.flatMap((question, index) =>
      scope === 'all' ||
      !question.answer.trim() ||
      question.questionParts.some((part) => !part.trim())
        ? [index]
        : [],
    );
    if (!selectedPackages.length || !templates.length || !targets.length) {
      return;
    }
    setThinking(true);
    setFailed(false);
    try {
      for (const [position, index] of targets.entries()) {
        setProgress([position + 1, targets.length]);
        onSelectQuestion(index);
        const additions = selectedPackages.flatMap((item) =>
          item.questions.filter(
            (question) => question.questionNumber === index + 1,
          ),
        );
        const requestedType = additions.find(
          (question) => question.questionType,
        )?.questionType;
        const template =
          templates.find((item) => item.name === requestedType) ??
          templates[index % templates.length]!;
        const context = selectedPackages
          .map((item) => `${item.name}:\n${item.context}`)
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
              <fieldset className="package-generation-rules">
                <legend>{copy.packageGeneration.rules}</legend>
                {activePackages.map((item, index) => (
                  <label key={`${item.name}-${index}`}>
                    <Checkbox
                      checked={selected.includes(index)}
                      disabled={thinking}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, index]
                            : current.filter((item) => item !== index),
                        )
                      }
                    />
                    {item.name}
                  </label>
                ))}
              </fieldset>
              {!activePackages.length && (
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
                    !selected.length ||
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
