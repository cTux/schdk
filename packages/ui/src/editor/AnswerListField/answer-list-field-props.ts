export interface AnswerListFieldProps {
  answers: string[];
  answerLabel(number: number): string;
  legend: string;
  onChange(answers: string[]): void;
  onBlur(index: number): void;
}
