import { StatusMessage } from '../atoms/StatusMessage';
import '../styles/editor.scss';
import { EditorHeader } from './EditorHeader';
import { PackageStart } from './PackageStart';
import { QuestionEditor } from './QuestionEditor';
import { QuestionList } from './QuestionList';
import type { EditorViewProps } from './types';

export type { EditorSaveStatus, RecentPackageItem } from './types';

export function EditorView({
  gamePackage,
  hasPackage,
  message,
  recentPackages,
  saveStatus,
  selectedIndex,
  showValidation,
  onAddHandout,
  onBack,
  onCopyQuestion,
  onCreatePackage,
  onOpenPackage,
  onOpenRecentPackage,
  onPasteQuestion,
  onQuestionChange,
  onSelectQuestion,
  onSwapQuestions,
  onTitleChange,
}: EditorViewProps) {
  return (
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
        recentPackages={recentPackages}
        onCreatePackage={onCreatePackage}
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
        />
        <QuestionEditor
          question={gamePackage.questions[selectedIndex]!}
          selectedIndex={selectedIndex}
          showValidation={showValidation}
          onAddHandout={onAddHandout}
          onChange={onQuestionChange}
          onCopy={onCopyQuestion}
          onPaste={onPasteQuestion}
          onSelectQuestion={onSelectQuestion}
        />
      </div>
      {message && <StatusMessage>{message}</StatusMessage>}
    </main>
  );
}
