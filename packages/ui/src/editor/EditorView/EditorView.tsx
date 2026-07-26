import './styles.scss';

import { StatusMessage } from '../../atoms/StatusMessage';
import { TooltipProvider } from '../../atoms/Tooltip';
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
  onQuestionTextBlur,
  onSelectQuestion,
  onSwapQuestions,
  onTitleChange,
}: EditorViewProps) {
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
      </main>
    </TooltipProvider>
  );
}
