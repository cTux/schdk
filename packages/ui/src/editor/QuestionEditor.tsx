import type { GameQuestion } from '@schdk/common';
import { TextAreaField } from '../atoms/TextAreaField';
import { AlternativeAnswersField } from './AlternativeAnswersField';
import { HostNotesField } from './HostNotesField';
import { QuestionEditorHeader } from './QuestionEditorHeader';
import { QuestionHandoutField } from './QuestionHandoutField';
import { QuestionNavigation } from './QuestionNavigation';
import { QuestionRemarkField } from './QuestionRemarkField';

interface QuestionEditorProps {
  question: GameQuestion;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onChange(change: Partial<GameQuestion>): void;
  onCopy(): void;
  onPaste(): void;
  onSelectQuestion(index: number): void;
}

export function QuestionEditor({
  question,
  selectedIndex,
  showValidation,
  onAddHandout,
  onChange,
  onCopy,
  onPaste,
  onSelectQuestion,
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
      />

      <div className="question-pair">
        <TextAreaField
          label="Текст питання"
          invalid={showValidation && !question.question.trim()}
          rows={7}
          value={question.question}
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
          rows={3}
          value={question.answer}
          onValueChange={(value) => onChange({ answer: value })}
        />
        <TextAreaField
          label="Коментар до відповіді"
          optional
          rows={3}
          value={question.answerComment ?? ''}
          onValueChange={(value) => onChange({ answerComment: value })}
        />
      </div>

      <AlternativeAnswersField
        answers={question.alternativeAnswers}
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
