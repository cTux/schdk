import type { GamePackage, GameQuestion } from '@schdk/common';

export type EditorSaveStatus = 'saved' | 'pending' | 'saving' | 'error';

export interface RecentPackageItem {
  id: string;
  name: string;
  title?: string;
  ready?: boolean;
}

export interface EditorViewProps {
  gamePackage: GamePackage;
  hasPackage: boolean;
  message: string;
  recentPackages: RecentPackageItem[];
  saveStatus: EditorSaveStatus;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onAnswerBlur(): void;
  onAnswerCommentBlur(): void;
  onAlternativeAnswerBlur(index: number): void;
  onBack(): void;
  onCopyQuestion(): void;
  onCreatePackage(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onPasteQuestion(): void;
  onQuestionChange(change: Partial<GameQuestion>): void;
  onQuestionTextBlur(): void;
  onSelectQuestion(index: number): void;
  onSwapQuestions(sourceIndex: number, targetIndex: number): void;
  onTitleChange(value: string): void;
}
