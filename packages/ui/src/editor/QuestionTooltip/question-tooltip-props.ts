import { type LocalizationCopy } from '../../localization';

export interface QuestionTooltipProps {
  answer: string;
  copy?: LocalizationCopy;
  hasSummary: boolean;
  id: string;
  question: string;
  remark: string;
}
