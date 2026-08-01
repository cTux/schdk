import type { GamePackage, GameQuestion } from '@schdk/common';
import type { QuestionDatabaseRow } from '../question-database';
import { type AiQuestionGenerationOptions } from './ai-question-generation-options';
import { type RecentPackageItem } from '../game-packages';
import { type EditorSaveStatus } from './types';

export interface EditorViewProps {
  aiGeneration?: AiQuestionGenerationOptions;
  document: {
    gamePackage: GamePackage;
    hasPackage: boolean;
    message: string;
    questionDatabaseRows: QuestionDatabaseRow[];
    saveStatus: EditorSaveStatus;
    selectedIndex: number;
    showValidation: boolean;
  };
  recents: {
    openingRecentPackageId?: string | null;
    recentPackages: RecentPackageItem[];
    recentPackagesLoading?: boolean;
    onDeleteRecentPackage(recent: RecentPackageItem): void;
    onDownloadRecentPackage(recent: RecentPackageItem): void;
    onOpenRecentPackage(recent: RecentPackageItem): void;
  };
  packageActions: {
    onBack(): void;
    onExit(): void;
    onCreatePackage(): void;
    onDeletePackage(): void;
    onOpenPackage(file: File): void;
    onTourPhraseChange(index: number, value: string): void;
    onTitleChange(value: string): void;
  };
  questionActions: {
    onAddHandout(file: File): void;
    onMusicBreakChange(index: number, file: File | null): void;
    onAnswerBlur(): void;
    onAnswerCommentBlur(): void;
    onAlternativeAnswerBlur(index: number): void;
    onWrongAnswerBlur(index: number): void;
    onCopyQuestion(): void;
    onPasteQuestion(): void;
    onQuestionChange(change: Partial<GameQuestion>): void;
    onDatabaseQuestionSelect(row: QuestionDatabaseRow): Promise<boolean>;
    onQuestionGenerated(index: number, question: GameQuestion): void;
    onQuestionTextBlur(index: number): void;
    onSelectQuestion(index: number): void;
    onSwapQuestions(sourceIndex: number, targetIndex: number): void;
  };
}
