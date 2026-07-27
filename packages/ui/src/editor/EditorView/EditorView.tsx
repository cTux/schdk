import 'react-toastify/dist/ReactToastify.css';
import './styles.scss';

import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { StatusMessage } from '../../atoms/StatusMessage';
import { TooltipProvider } from '../../atoms/Tooltip';
import { editorToastCopy } from '../../localization/editor-toast';
import { useLocalization } from '../../localization';
import { EditorHeader } from '../EditorHeader';
import { PackageStart } from '../PackageStart';
import { QuestionEditor } from '../QuestionEditor';
import { QuestionList } from '../QuestionList';
import type { EditorViewProps } from '../types';

export type { EditorSaveStatus, RecentPackageItem } from '../types';

export function EditorView({
  aiGeneration,
  gamePackage,
  hasPackage,
  message,
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
  onCopyQuestion,
  onCreatePackage,
  onDeleteRecentPackage,
  onDownloadRecentPackage,
  onOpenPackage,
  onOpenRecentPackage,
  onPasteQuestion,
  onQuestionChange,
  onQuestionGenerated,
  onQuestionTextBlur,
  onSelectQuestion,
  onSwapQuestions,
  onTitleChange,
}: EditorViewProps) {
  const { locale } = useLocalization();
  const toastCopy = editorToastCopy[locale];

  useEffect(() => {
    if (!hasPackage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.altKey || event.shiftKey || event.repeat) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

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
      <main className="editor-app">
        <EditorHeader
          hasPackage={hasPackage}
          packageTitle={gamePackage.title}
          saveStatus={saveStatus}
          showValidation={showValidation}
          onBack={onBack}
          onTitleChange={onTitleChange}
          aiGeneration={aiGeneration}
          gamePackage={gamePackage}
          onQuestionGenerated={onQuestionGenerated}
          onSelectQuestion={onSelectQuestion}
        />
        <PackageStart
          hidden={hasPackage}
          openingRecentPackageId={openingRecentPackageId}
          recentPackages={recentPackages}
          recentPackagesLoading={recentPackagesLoading}
          onCreatePackage={onCreatePackage}
          onDeleteRecentPackage={onDeleteRecentPackage}
          onDownloadRecentPackage={onDownloadRecentPackage}
          onOpenPackage={onOpenPackage}
          onOpenRecentPackage={onOpenRecentPackage}
        />
        <div className="editor-layout" hidden={!hasPackage}>
          <QuestionList
            gamePackage={gamePackage}
            selectedIndex={selectedIndex}
            showValidation={showValidation}
            onSelectQuestion={onSelectQuestion}
            onSwapQuestions={onSwapQuestions}
            onMusicBreakChange={onMusicBreakChange}
          />
          <QuestionEditor
            aiGeneration={aiGeneration}
            question={gamePackage.questions[selectedIndex]!}
            selectedIndex={selectedIndex}
            showValidation={showValidation}
            onAddHandout={onAddHandout}
            onChange={onQuestionChange}
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
          autoClose={2000}
          closeButton={false}
          closeOnClick
          limit={2}
          newestOnTop
          pauseOnHover
          position="bottom-right"
          toastClassName="editor-toast"
        />
      </main>
    </TooltipProvider>
  );
}
