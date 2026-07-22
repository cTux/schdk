import {
  QUESTIONS_PER_ROUND,
  type GamePackage,
  type GameQuestion,
} from '@schdk/common';
import { Button } from '../atoms/Button';

export function getQuestionListItem(
  question: GameQuestion,
  showValidation: boolean,
) {
  const questionText = question.question.trim();
  const answer = question.answer.trim();
  const remark = question.comment?.trim() ?? '';
  const hasSummary = Boolean(questionText && answer);
  const complete = hasSummary && !remark;

  return {
    answer,
    complete,
    hasPreview: hasSummary || Boolean(remark),
    hasSummary,
    invalid: showValidation && !complete,
    questionText,
    remark,
  };
}

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
              const item = getQuestionListItem(question, showValidation);
              const tooltipId = `question-tooltip-${index}`;
              return (
                <Button
                  className={[
                    index === selectedIndex ? 'selected' : '',
                    item.complete ? 'complete' : '',
                    item.invalid ? 'invalid' : '',
                    item.remark ? 'remark' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={index}
                  type="button"
                  onClick={() => onSelectQuestion(index)}
                  aria-label={`Питання ${index + 1}`}
                  aria-describedby={item.hasPreview ? tooltipId : undefined}
                  aria-invalid={item.invalid}
                >
                  <span>{index + 1}</span>
                  {item.hasPreview && (
                    <span
                      className="question-tooltip"
                      id={tooltipId}
                      role="tooltip"
                    >
                      {item.hasSummary && (
                        <span className="question-tooltip-block">
                          <strong>Питання</strong>
                          <span>{item.questionText}</span>
                        </span>
                      )}
                      {item.remark && (
                        <span className="question-tooltip-block question-tooltip-remark">
                          <strong>Зауваження</strong>
                          <span>{item.remark}</span>
                        </span>
                      )}
                      {item.hasSummary && (
                        <span className="question-tooltip-block">
                          <strong>Відповідь</strong>
                          <span>{item.answer}</span>
                        </span>
                      )}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
