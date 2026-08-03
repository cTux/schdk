import type { GameQuestion } from '@schdk/common/game-question';
import type { QuestionDatabaseRow } from '../../question-database';
import type { AiQuestionGenerationOptions } from '../types';

export interface QuestionEditorHeaderProps {
  aiGeneration?: AiQuestionGenerationOptions;
  questionDatabaseRows: QuestionDatabaseRow[];
  questionNumber: number;
  onDatabaseQuestionSelect(row: QuestionDatabaseRow): Promise<boolean>;
  onGenerated(question: GameQuestion): void;
  onClear(): void;
  onCopy(): void;
  onPaste(): void;
}
