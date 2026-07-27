import type {
  AIQuestion,
  AIQuestionsPackage,
  GamePackage,
  GameQuestion,
} from '@schdk/common';

export type EditorSaveStatus = 'saved' | 'pending' | 'saving' | 'error';

export interface RecentPackageItem {
  id: string;
  name: string;
  title?: string;
  ready?: boolean;
}

export interface AiQuestionGenerationOptions {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  packages: AIQuestionsPackage[];
  onGenerationStart?(): Promise<void>;
  getPromptPreview?(template: AIQuestion, context: string): string;
  onGenerate(template: AIQuestion, context: string): Promise<GameQuestion>;
}

export interface EditorViewProps {
  aiGeneration?: AiQuestionGenerationOptions;
  gamePackage: GamePackage;
  hasPackage: boolean;
  message: string;
  openingRecentPackageId?: string | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  saveStatus: EditorSaveStatus;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onMusicBreakChange(index: number, file: File | null): void;
  onAnswerBlur(): void;
  onAnswerCommentBlur(): void;
  onAlternativeAnswerBlur(index: number): void;
  onWrongAnswerBlur(index: number): void;
  onBack(): void;
  onCopyQuestion(): void;
  onCreatePackage(): void;
  onDeleteRecentPackage(recent: RecentPackageItem): void;
  onDownloadRecentPackage(recent: RecentPackageItem): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onPasteQuestion(): void;
  onQuestionChange(change: Partial<GameQuestion>): void;
  onQuestionGenerated(index: number, question: GameQuestion): void;
  onQuestionTextBlur(index: number): void;
  onSelectQuestion(index: number): void;
  onSwapQuestions(sourceIndex: number, targetIndex: number): void;
  onTitleChange(value: string): void;
}
