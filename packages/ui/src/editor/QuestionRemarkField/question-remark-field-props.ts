export interface QuestionRemarkFieldProps {
  remark: string;
  showValidation: boolean;
  onChange(remark: string): void;
  onResolve(): void;
}
