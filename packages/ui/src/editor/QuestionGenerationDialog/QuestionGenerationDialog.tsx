import './styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { useState } from 'react';
import {
  AI_QUESTION_DIFFICULTIES,
  compareFavoriteItemsByName,
  type AIQuestionDifficulty,
} from '@schdk/common';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { IconButton } from '../../atoms/IconButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import type { QuestionGenerationDialogProps } from './types';

export function QuestionGenerationDialog({
  apiKeyConfigured,
  templates,
  getPromptPreview,
  onGenerate,
  excludedAnswers = [],
  onGenerated,
}: QuestionGenerationDialogProps) {
  const { copy } = useLocalization();
  const [open, setOpen] = useState(false);
  const [templateIndex, setTemplateIndex] = useState('0');
  const [difficulty, setDifficulty] = useState<AIQuestionDifficulty>('medium');
  const [context, setContext] = useState('');
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const sortedTemplates = [...templates].sort(compareFavoriteItemsByName);
  const selectedTemplate =
    sortedTemplates[Number(templateIndex)] ?? sortedTemplates[0] ?? null;

  function reset() {
    setOpen(false);
    setTemplateIndex('0');
    setDifficulty('medium');
    setContext('');
    setThinking(false);
    setFailed(false);
    setPromptOpen(false);
  }

  async function generate() {
    if (!selectedTemplate || !context.trim()) return;
    setThinking(true);
    setFailed(false);
    try {
      const question = await onGenerate(
        selectedTemplate,
        context.trim(),
        excludedAnswers,
        difficulty,
      );
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
            <Dialog.Popup
              className={classNames('question-generation-popup', {
                'question-generation-popup-prompt': promptOpen,
              })}
            >
              <div className="question-generation-title-row">
                <Dialog.Title className="question-generation-title">
                  {copy.questionGeneration.title}
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
                    {copy.questionGeneration.description}
                  </Dialog.Description>
                  <label>
                    {copy.questionGeneration.template}
                    <Dropdown
                      value={templateIndex}
                      disabled={thinking || sortedTemplates.length === 0}
                      onChange={(event) => setTemplateIndex(event.target.value)}
                    >
                      {sortedTemplates.map((template, index) => (
                        <option key={`${template.name}-${index}`} value={index}>
                          {template.favorite ? '⭐ ' : ''}
                          {template.name}
                        </option>
                      ))}
                    </Dropdown>
                  </label>
                  {sortedTemplates.length === 0 && (
                    <p className="question-generation-message">
                      {copy.questionGeneration.noTemplates}
                    </p>
                  )}
                  <label>
                    {copy.questionGeneration.difficulty}
                    <Dropdown
                      value={difficulty}
                      disabled={thinking}
                      onChange={(event) =>
                        setDifficulty(
                          event.target.value as AIQuestionDifficulty,
                        )
                      }
                    >
                      {AI_QUESTION_DIFFICULTIES.map((value) => (
                        <option key={value} value={value}>
                          {copy.questionGeneration.difficulties[value]}
                        </option>
                      ))}
                    </Dropdown>
                  </label>
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
                      disabled={
                        thinking || !selectedTemplate || !context.trim()
                      }
                      aria-busy={thinking}
                      onClick={() => void generate()}
                    >
                      {thinking
                        ? copy.questionGeneration.thinking
                        : copy.questionGeneration.generate}
                    </Button>
                  </div>
                </div>
                {promptOpen && selectedTemplate && getPromptPreview && (
                  <label className="question-generation-prompt">
                    {copy.questionGeneration.prompt}
                    <Textarea
                      readOnly
                      value={getPromptPreview(
                        selectedTemplate,
                        context.trim(),
                        excludedAnswers,
                        difficulty,
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
