import { QUESTION_COUNT } from '@schdk/common';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../atoms/Button';

interface QuestionNavigationProps {
  selectedIndex: number;
  onSelect(index: number): void;
}

export function QuestionNavigation({
  selectedIndex,
  onSelect,
}: QuestionNavigationProps) {
  return (
    <div className="question-actions">
      <Button
        type="button"
        disabled={selectedIndex === 0}
        onClick={() => onSelect(selectedIndex - 1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Попереднє
      </Button>
      <Button
        type="button"
        disabled={selectedIndex === QUESTION_COUNT - 1}
        onClick={() => onSelect(selectedIndex + 1)}
      >
        Наступне <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Button>
    </div>
  );
}
