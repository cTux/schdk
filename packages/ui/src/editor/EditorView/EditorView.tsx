import 'react-toastify/dist/ReactToastify.css';
import './styles.scss';

import { getGameQuestionAnswers } from '@schdk/common';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { StatusMessage } from '../../atoms/StatusMessage';
import { TooltipProvider } from '../../atoms/Tooltip';
import { Page } from '../../shell/Page';
import { editorToastCopy } from '../../localization/editor-toast';
import { useLocalization } from '../../localization';
import { EditorHeader } from '../EditorHeader';
import { PackageDropZone } from '../PackageDropZone';
import { PackageStart } from '../PackageStart';
import { QuestionEditor } from '../QuestionEditor';
import { QuestionList } from '../QuestionList';
import type {
  EditorSaveStatus,
  EditorViewProps,
  RecentPackageItem,
} from '../types';

function EditorView({
  aiGeneration,
  gamePackage,
  hasPackage,
  message,
  questionDatabaseRows,
  openingRecentPackageId = null,
  recentPackages,
  recentPackagesLoading = false,
  saveStatus,
  selectedIndex,
  showValidation,
  onAddHandout,
  onMusicBreakChange,
  onAnswerBlur,
  onAnswerCommentBlur,
  onAlternativeAnswerBlur,
  onWrongAnswerBlur,
  onBack,
  onExit,
  onCopyQuestion,
  onCreatePackage,
  onDeletePackage,
  onDeleteRecentPackage,
  onDownloadRecentPackage,
  onOpenPackage,
  onOpenRecentPackage,
  onPasteQuestion,
  onQuestionChange,
  onDatabaseQuestionSelect,
  onQuestionGenerated,
  onQuestionTextBlur,
  onSelectQuestion,
  onSwapQuestions,
  onTourPhraseChange,
  onTitleChange,
}: EditorViewProps) {
  const { copy, locale } = useLocalization();
  const toastCopy = editorToastCopy[locale];
  const [pendingGenerationIndexes, setPendingGenerationIndexes] = useState<
    number[]
  >([]);
  const [packageGenerationDocked, setPackageGenerationDocked] = useState(false);
  const [questionGenerationDocked, setQuestionGenerationDocked] =
    useState(false);
  const [pendingQuestionGenerationIndex, setPendingQuestionGenerationIndex] =
    useState<number | null>(null);
  const questionGeneration = aiGeneration && {
    ...aiGeneration,
    excludedAnswers: gamePackage.questions.flatMap((question, index) =>
      index === selectedIndex ? [] : getGameQuestionAnswers(question),
    ),
    onQuestionGenerationStateChange: (generating: boolean, docked: boolean) => {
      setPendingQuestionGenerationIndex(generating ? selectedIndex : null);
      setQuestionGenerationDocked(docked);
    },
  };

  useEffect(() => {
    if (!hasPackage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCopyPasteShortcut =
        event.ctrlKey && !event.altKey && !event.shiftKey && !event.repeat;
      if (!isCopyPasteShortcut) return;

      const target = event.target;
      const isEditingText =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isEditingText) return;

      const action =
        event.key.toLowerCase() === 'c'
          ? onCopyQuestion
          : event.key.toLowerCase() === 'v'
            ? onPasteQuestion
            : undefined;
      if (!action) return;

      event.preventDefault();
      action();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasPackage, onCopyQuestion, onPasteQuestion]);

  return (
    <TooltipProvider>
      <Page
        className={classNames('editor-app', {
          'editor-app-package-generation':
            packageGenerationDocked || questionGenerationDocked,
        })}
        title={copy.shell.editor.label}
        headerContent={<p>{copy.shell.editor.description}</p>}
        headerActions={
          hasPackage ? (
            <EditorHeader
              hasPackage={hasPackage}
              packageTitle={gamePackage.title}
              saveStatus={saveStatus}
              showValidation={showValidation}
              onDeletePackage={onDeletePackage}
              onTitleChange={onTitleChange}
              aiGeneration={aiGeneration}
              gamePackage={gamePackage}
              onQuestionGenerated={onQuestionGenerated}
              onPackageGenerationStateChange={(pendingIndexes, docked) => {
                setPendingGenerationIndexes(pendingIndexes);
                setPackageGenerationDocked(docked);
              }}
              onSelectQuestion={onSelectQuestion}
            />
          ) : (
            <PackageDropZone
              compact
              hidden={false}
              onCreate={onCreatePackage}
              onOpen={onOpenPackage}
            />
          )
        }
        onBack={hasPackage ? onBack : onExit}
      >
        <main>
          {!hasPackage && (
            <PackageStart
              hidden={false}
              openingRecentPackageId={openingRecentPackageId}
              recentPackages={recentPackages}
              recentPackagesLoading={recentPackagesLoading}
              onDeleteRecentPackage={onDeleteRecentPackage}
              onDownloadRecentPackage={onDownloadRecentPackage}
              onOpenRecentPackage={onOpenRecentPackage}
            />
          )}
          <div className="editor-layout" hidden={!hasPackage}>
            <QuestionList
              gamePackage={gamePackage}
              selectedIndex={selectedIndex}
              showValidation={showValidation}
              onSelectQuestion={onSelectQuestion}
              onSwapQuestions={onSwapQuestions}
              onTourPhraseChange={onTourPhraseChange}
              onMusicBreakChange={onMusicBreakChange}
            />
            <QuestionEditor
              aiGeneration={questionGeneration}
              disabled={
                pendingGenerationIndexes.includes(selectedIndex) ||
                pendingQuestionGenerationIndex === selectedIndex
              }
              question={gamePackage.questions[selectedIndex]!}
              questionDatabaseRows={questionDatabaseRows}
              selectedIndex={selectedIndex}
              showValidation={showValidation}
              onAddHandout={onAddHandout}
              onChange={onQuestionChange}
              onDatabaseQuestionSelect={onDatabaseQuestionSelect}
              onGenerated={(question) =>
                onQuestionGenerated(selectedIndex, question)
              }
              onAnswerBlur={onAnswerBlur}
              onAnswerCommentBlur={onAnswerCommentBlur}
              onAlternativeAnswerBlur={onAlternativeAnswerBlur}
              onWrongAnswerBlur={onWrongAnswerBlur}
              onCopy={onCopyQuestion}
              onPaste={onPasteQuestion}
              onSelectQuestion={onSelectQuestion}
              onQuestionTextBlur={onQuestionTextBlur}
            />
          </div>
          {message && <StatusMessage>{message}</StatusMessage>}
          <ToastContainer
            aria-label={toastCopy.notifications}
            closeButton={false}
            closeOnClick
            limit={2}
            newestOnTop
            pauseOnHover
            position="bottom-right"
            toastClassName="editor-toast"
          />
        </main>
      </Page>
    </TooltipProvider>
  );
}

export { EditorView, type EditorSaveStatus, type RecentPackageItem };
