import {
  QUESTION_TYPE_CONFIG,
  type GameQuestion,
  type GameQuestionType,
} from '@schdk/common';
import { Dropdown } from '../../atoms/Dropdown';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { AnswerListField } from '../AnswerListField';
import { HostNotesField } from '../HostNotesField';
import { QuestionEditorHeader } from '../QuestionEditorHeader';
import { QuestionHandoutField } from '../QuestionHandoutField';
import { QuestionNavigation } from '../QuestionNavigation';
import { QuestionRemarkField } from '../QuestionRemarkField';
import type { AiQuestionGenerationOptions } from '../types';

export interface QuestionEditorProps {
  aiGeneration?: AiQuestionGenerationOptions;
  question: GameQuestion;
  selectedIndex: number;
  showValidation: boolean;
  onAddHandout(file: File): void;
  onAnswerBlur(): void;
  onAnswerCommentBlur(): void;
  onAlternativeAnswerBlur(index: number): void;
  onWrongAnswerBlur(index: number): void;
  onChange(change: Partial<GameQuestion>): void;
  onCopy(): void;
  onPaste(): void;
  onSelectQuestion(index: number): void;
  onQuestionTextBlur(index: number): void;
}

export function QuestionEditor({
  aiGeneration,
  question,
  selectedIndex,
  showValidation,
  onAddHandout,
  onAnswerBlur,
  onAnswerCommentBlur,
  onAlternativeAnswerBlur,
  onWrongAnswerBlur,
  onChange,
  onCopy,
  onPaste,
  onSelectQuestion,
  onQuestionTextBlur,
}: QuestionEditorProps) {
  const { copy } = useLocalization();

  function changeQuestionType(type: GameQuestionType) {
    const partCount = QUESTION_TYPE_CONFIG[type].partCount;
    onChange({
      type,
      questionParts: Array.from(
        { length: partCount },
        (_, index) => question.questionParts[index] ?? '',
      ),
    });
  }

  return (
    <section className="question-editor">
      <QuestionEditorHeader
        aiGeneration={aiGeneration}
        questionNumber={selectedIndex + 1}
        onGenerated={onChange}
        onCopy={onCopy}
        onPaste={onPaste}
      />

      <label className="question-type">
        {copy.editor.questionType}
        <Dropdown
          value={question.type}
          onChange={(event) =>
            changeQuestionType(event.target.value as GameQuestionType)
          }
        >
          <option value="standard">{copy.editor.questionTypes.standard}</option>
          <option value="blitz-2x30">
            {copy.editor.questionTypes.blitz2x30}
          </option>
          <option value="blitz-3x20">
            {copy.editor.questionTypes.blitz3x20}
          </option>
        </Dropdown>
      </label>

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
        <div className="question-part-fields">
          {question.questionParts.map((part, index) => (
            <TextAreaField
              key={index}
              label={
                question.questionParts.length === 1
                  ? copy.editor.questionText
                  : copy.editor.questionPart(index + 1)
              }
              invalid={showValidation && !part.trim()}
              rows={7}
              value={part}
              onBlur={() => onQuestionTextBlur(index)}
              onValueChange={(value) =>
                onChange({
                  questionParts: question.questionParts.map(
                    (currentPart, partIndex) =>
                      partIndex === index ? value : currentPart,
                  ),
                })
              }
            />
          ))}
        </div>
        <QuestionRemarkField
          remark={question.comment ?? ''}
          showValidation={showValidation}
          onChange={(value) => onChange({ comment: value })}
          onResolve={() => onChange({ comment: undefined })}
        />
      </div>

      <div className="question-pair">
        <TextAreaField
          label={copy.shared.answer}
          invalid={showValidation && !question.answer.trim()}
          rows={7}
          value={question.answer}
          onBlur={onAnswerBlur}
          onValueChange={(value) => onChange({ answer: value })}
        />
        <TextAreaField
          label={copy.shared.answerComment}
          optional
          optionalLabel={copy.shared.optional}
          rows={7}
          value={question.answerComment ?? ''}
          onBlur={onAnswerCommentBlur}
          onValueChange={(value) => onChange({ answerComment: value })}
        />
      </div>

      <AnswerListField
        answers={question.alternativeAnswers}
        answerLabel={copy.editor.alternativeAnswer}
        legend={copy.editor.alternativeAnswers}
        onBlur={onAlternativeAnswerBlur}
        onChange={(alternativeAnswers) => onChange({ alternativeAnswers })}
      />
      <AnswerListField
        answers={question.wrongAnswers}
        answerLabel={copy.editor.wrongAnswer}
        legend={copy.editor.wrongAnswers}
        onBlur={onWrongAnswerBlur}
        onChange={(wrongAnswers) => onChange({ wrongAnswers })}
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
