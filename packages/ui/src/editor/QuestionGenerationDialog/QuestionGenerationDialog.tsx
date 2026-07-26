import './styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { IconButton } from '../../atoms/IconButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import type { QuestionGenerationDialogProps } from './types';

export function QuestionGenerationDialog({
  apiKeyConfigured,
  templates,
  onGenerate,
  onGenerated,
}: QuestionGenerationDialogProps) {
  const { copy } = useLocalization();
  const [open, setOpen] = useState(false);
  const [templateIndex, setTemplateIndex] = useState('0');
  const [context, setContext] = useState('');
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const selectedTemplate =
    templates[Number(templateIndex)] ?? templates[0] ?? null;

  function reset() {
    setOpen(false);
    setTemplateIndex('0');
    setContext('');
    setThinking(false);
    setFailed(false);
  }

  async function generate() {
    if (!selectedTemplate || !context.trim()) return;
    setThinking(true);
    setFailed(false);
    try {
      const question = await onGenerate(selectedTemplate, context.trim());
      onGenerated(question);
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
        label={copy.questionGeneration.open}
        tooltipLabel={
          apiKeyConfigured
            ? copy.questionGeneration.open
            : copy.questionGeneration.apiKeyMissing
        }
        disabled={!apiKeyConfigured}
        onClick={() => setOpen(true)}
      />
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (thinking) return;
          if (nextOpen) setOpen(true);
          else reset();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="question-generation-backdrop" />
          <Dialog.Viewport className="question-generation-viewport">
            <Dialog.Popup className="question-generation-popup">
              <Dialog.Title className="question-generation-title">
                {copy.questionGeneration.title}
              </Dialog.Title>
              <Dialog.Description className="question-generation-description">
                {copy.questionGeneration.description}
              </Dialog.Description>
              <label>
                {copy.questionGeneration.template}
                <Dropdown
                  value={templateIndex}
                  disabled={thinking || templates.length === 0}
                  onChange={(event) => setTemplateIndex(event.target.value)}
                >
                  {templates.map((template, index) => (
                    <option key={`${template.name}-${index}`} value={index}>
                      {template.name}
                    </option>
                  ))}
                </Dropdown>
              </label>
              {templates.length === 0 && (
                <p className="question-generation-message">
                  {copy.questionGeneration.noTemplates}
                </p>
              )}
              <TextAreaField
                label={copy.questionGeneration.context}
                placeholder={copy.questionGeneration.contextPlaceholder}
                rows={6}
                value={context}
                disabled={thinking}
                onValueChange={setContext}
              />
              {failed && (
                <p className="question-generation-error" role="alert">
                  {copy.questionGeneration.failed}
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
                  disabled={thinking || !selectedTemplate || !context.trim()}
                  aria-busy={thinking}
                  onClick={() => void generate()}
                >
                  {thinking
                    ? copy.questionGeneration.thinking
                    : copy.questionGeneration.generate}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
