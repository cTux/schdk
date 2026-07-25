import './styles.scss';

import type { GameQuestion } from '@schdk/common';
import { TextAreaField } from '../../atoms/TextAreaField';
import { AlternativeAnswersField } from '../AlternativeAnswersField';
import { HostNotesField } from '../HostNotesField';
import { QuestionEditorHeader } from '../QuestionEditorHeader';
import { QuestionHandoutField } from '../QuestionHandoutField';
import { QuestionNavigation } from '../QuestionNavigation';
import { QuestionRemarkField } from '../QuestionRemarkField';

export interface QuestionEditorProps {
  question: GameQuestion;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onAnswerBlur(): void;
  onAnswerCommentBlur(): void;
  onAlternativeAnswerBlur(index: number): void;
  onChange(change: Partial<GameQuestion>): void;
  onCopy(): void;
  onPaste(): void;
  onSelectQuestion(index: number): void;
  onQuestionTextBlur(): void;
}

export function QuestionEditor({
  question,
  selectedIndex,
  showValidation,
  onAddHandout,
  onAnswerBlur,
  onAnswerCommentBlur,
  onAlternativeAnswerBlur,
  onChange,
  onCopy,
  onPaste,
  onSelectQuestion,
  onQuestionTextBlur,
}: QuestionEditorProps) {
  return (
    <section className="question-editor">
      <QuestionEditorHeader
        questionNumber={selectedIndex + 1}
        onCopy={onCopy}
        onPaste={onPaste}
      />

      <QuestionHandoutField
        handout={question.handout}
        onAdd={onAddHandout}
        onRemove={() => onChange({ handout: undefined })}
        onTextChange={(text) =>
          onChange({
            handout: text ? { kind: 'text', text } : undefined,
          })
        }
      />

      <div className="question-pair">
        <TextAreaField
          label="Текст питання"
          invalid={showValidation && !question.question.trim()}
          rows={7}
          value={question.question}
          onBlur={onQuestionTextBlur}
          onValueChange={(value) => onChange({ question: value })}
        />
        <QuestionRemarkField
          remark={question.comment ?? ''}
          showValidation={showValidation}
          onChange={(value) => onChange({ comment: value })}
          onResolve={() => onChange({ comment: undefined })}
        />
      </div>

      <div className="question-pair">
        <TextAreaField
          label="Відповідь"
          invalid={showValidation && !question.answer.trim()}
          rows={7}
          value={question.answer}
          onBlur={onAnswerBlur}
          onValueChange={(value) => onChange({ answer: value })}
        />
        <TextAreaField
          label="Коментар до відповіді"
          optional
          rows={7}
          value={question.answerComment ?? ''}
          onBlur={onAnswerCommentBlur}
          onValueChange={(value) => onChange({ answerComment: value })}
        />
      </div>

      <AlternativeAnswersField
        answers={question.alternativeAnswers}
        onBlur={onAlternativeAnswerBlur}
        onChange={(alternativeAnswers) => onChange({ alternativeAnswers })}
      />

      <HostNotesField
        value={question.hostNotes ?? ''}
        onChange={(value) => onChange({ hostNotes: value })}
      />

      <QuestionNavigation
        selectedIndex={selectedIndex}
        onSelect={onSelectQuestion}
      />
    </section>
  );
}
