import './styles.scss';

import { QUESTION_COUNT } from '@schdk/common';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';

export interface QuestionNavigationProps {
  selectedIndex: number;
  onSelect(index: number): void;
}

export function QuestionNavigation({
  selectedIndex,
  onSelect,
}: QuestionNavigationProps) {
  return (
    <div className="question-actions">
      <IconButton
        icon={faArrowLeft}
        label="Попереднє питання"
        disabled={selectedIndex === 0}
        onClick={() => onSelect(selectedIndex - 1)}
      />
      <IconButton
        icon={faArrowRight}
        label="Наступне питання"
        disabled={selectedIndex === QUESTION_COUNT - 1}
        onClick={() => onSelect(selectedIndex + 1)}
      />
    </div>
  );
}
