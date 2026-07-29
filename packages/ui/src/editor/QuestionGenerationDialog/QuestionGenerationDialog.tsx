import './styles.scss';

import { Dialog } from '@base-ui/react/dialog';
import {
  faChevronLeft,
  faChevronRight,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
} from '@schdk/common';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { IconButton } from '../../atoms/IconButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { Textarea } from '../../atoms/Textarea';
import { useLocalization } from '../../localization';
import { QuestionDatabaseCheck } from '../QuestionDatabaseCheck';
import { dockedGenerationViewportClassName } from '../docked-generation-viewport-class-name';
import type { QuestionGenerationDialogProps } from './types';
import { useQuestionGeneration } from './use-question-generation';

export function QuestionGenerationDialog({
  apiKeyConfigured,
  templates,
  onGenerationStart,
  getPromptPreview,
  onGenerate,
  excludedAnswers = [],
  onGenerated,
  onQuestionGenerationStateChange,
}: QuestionGenerationDialogProps) {
  const { copy } = useLocalization();
  const generation = useQuestionGeneration({
    apiKeyConfigured,
    templates,
    onGenerationStart,
    getPromptPreview,
    onGenerate,
    onQuestionGenerationStateChange,
    excludedAnswers,
    onGenerated,
  });
  const {
    background,
    checkQuestionDatabase,
    context,
    difficulty,
    failed,
    generate,
    generateInBackground,
    open,
    promptOpen,
    recognizability,
    reset,
    selectedTemplate,
    setCheckQuestionDatabase,
    setContext,
    setDifficulty,
    setPromptOpen,
    setRecognizability,
    setTemplateIndex,
    show,
    sortedTemplates,
    templateIndex,
    thinking,
  } = generation;

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
        onClick={show}
      />
      <Dialog.Root
        modal={!background}
        open={open}
        onOpenChange={(nextOpen) => {
          if (thinking) return;
          if (nextOpen) show();
          else reset();
        }}
      >
        <Dialog.Portal>
          {!background && (
            <Dialog.Backdrop className="question-generation-backdrop" />
          )}
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
                        setDifficulty(event.target.value as typeof difficulty)
                      }
                    >
                      {AI_QUESTION_DIFFICULTIES.map((value) => (
                        <option key={value} value={value}>
                          {copy.questionGeneration.difficulties[value]}
                        </option>
                      ))}
                    </Dropdown>
                  </label>
                  <label>
                    {copy.questionGeneration.recognizability}
                    <Dropdown
                      value={recognizability}
                      disabled={thinking}
                      onChange={(event) =>
                        setRecognizability(
                          event.target.value as typeof recognizability,
                        )
                      }
                    >
                      {AI_QUESTION_RECOGNIZABILITIES.map((value) => (
                        <option key={value} value={value}>
                          {copy.questionGeneration.recognizabilities[value]}
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
                  <QuestionDatabaseCheck
                    checked={checkQuestionDatabase}
                    disabled={thinking}
                    label={copy.questionGeneration.checkDatabase}
                    onChange={setCheckQuestionDatabase}
                  />
                  {failed && (
                    <p className="question-generation-error" role="alert">
                      {copy.questionGeneration.failed}
                    </p>
                  )}
                  <div className="question-generation-actions">
                    {thinking && !background && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={generateInBackground}
                      >
                        {copy.packageGeneration.background}
                      </Button>
                    )}
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
    </>
  );
}
