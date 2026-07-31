import { type GameQuestion } from '@schdk/common';
import type { QuestionDatabaseRow } from '../../shell/QuestionDatabasePage';
import type { AiQuestionGenerationOptions } from '../types';

export interface QuestionEditorProps {
  aiGeneration?: AiQuestionGenerationOptions;
  question: GameQuestion;
  questionDatabaseRows: QuestionDatabaseRow[];
  disabled?: boolean;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onAnswerBlur(): void;
  onAnswerCommentBlur(): void;
  onAlternativeAnswerBlur(index: number): void;
  onWrongAnswerBlur(index: number): void;
  onChange(change: Partial<GameQuestion>): void;
  onDatabaseQuestionSelect(row: QuestionDatabaseRow): Promise<boolean>;
  onGenerated(question: GameQuestion): void;
  onCopy(): void;
  onPaste(): void;
  onQuestionTextBlur(index: number): void;
}
