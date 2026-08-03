import type { GameQuestion } from '@schdk/common/game-question';
import type { QuestionDatabaseRow } from '../../question-database';
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
