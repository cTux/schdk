import { type GamePackage } from '@schdk/common';

export interface QuestionListProps {
  gamePackage: GamePackage;
  selectedIndex: number;
  showValidation: boolean;
  onSelectQuestion(index: number): void;
  onSwapQuestions(sourceIndex: number, targetIndex: number): void;
  onTourPhraseChange(index: number, value: string): void;
  onMusicBreakChange(index: number, file: File | null): void;
}
