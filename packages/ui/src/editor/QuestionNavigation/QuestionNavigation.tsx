import { QUESTION_COUNT } from '@schdk/common';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { type QuestionNavigationProps } from './question-navigation-props';

function QuestionNavigation({
  selectedIndex,
  onSelect,
}: QuestionNavigationProps) {
  const { copy } = useLocalization();

  return (
    <div className="question-actions">
      <IconButton
        icon={faArrowLeft}
        label={copy.editor.previousQuestion}
        disabled={selectedIndex === 0}
        onClick={() => onSelect(selectedIndex - 1)}
      />
      <IconButton
        icon={faArrowRight}
        label={copy.editor.nextQuestion}
        disabled={selectedIndex === QUESTION_COUNT - 1}
        onClick={() => onSelect(selectedIndex + 1)}
      />
    </div>
  );
}

export { type QuestionNavigationProps, QuestionNavigation };
