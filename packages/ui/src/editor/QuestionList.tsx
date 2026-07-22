import { QUESTIONS_PER_ROUND, type GamePackage } from '@schdk/common';
import { Button } from '../atoms/Button';

interface QuestionListProps {
  gamePackage: GamePackage;
  selectedIndex: number;
  showValidation: boolean;
  onSelectQuestion(index: number): void;
}

export function QuestionList({
  gamePackage,
  selectedIndex,
  showValidation,
  onSelectQuestion,
}: QuestionListProps) {
  return (
    <nav className="question-list" aria-label="Питання пакета">
      {[0, 1, 2].map((round) => (
        <section key={round}>
          <h2>Раунд {round + 1}</h2>
          <div className="question-grid">
            {Array.from({ length: QUESTIONS_PER_ROUND }, (_, offset) => {
              const index = round * QUESTIONS_PER_ROUND + offset;
              const question = gamePackage.questions[index]!;
              const valid = Boolean(
                question.question.trim() &&
                question.answer.trim() &&
                !question.comment?.trim(),
              );
              const invalid = showValidation && !valid;
              return (
                <Button
                  className={[
                    index === selectedIndex ? 'selected' : '',
                    valid ? 'complete' : '',
                    invalid ? 'invalid' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={index}
                  type="button"
                  onClick={() => onSelectQuestion(index)}
                  aria-label={`Питання ${index + 1}`}
                  aria-invalid={invalid}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
