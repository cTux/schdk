import {
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
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
import { type QuestionEditorProps } from './question-editor-props';

function QuestionEditor({
  aiGeneration,
  question,
  questionDatabaseRows,
  disabled = false,
  selectedIndex,
  showValidation,
  onAddHandout,
  onAnswerBlur,
  onAnswerCommentBlur,
  onAlternativeAnswerBlur,
  onWrongAnswerBlur,
  onChange,
  onDatabaseQuestionSelect,
  onGenerated,
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
      <fieldset className="question-editor-fields" disabled={disabled}>
        <QuestionEditorHeader
          aiGeneration={aiGeneration}
          questionDatabaseRows={questionDatabaseRows}
          questionNumber={selectedIndex + 1}
          onDatabaseQuestionSelect={onDatabaseQuestionSelect}
          onGenerated={onGenerated}
          onClear={() => onChange(createEmptyGameQuestion())}
          onCopy={onCopy}
          onPaste={onPaste}
        />

        {question.aiGeneration && (
          <div className="ai-generation-details">
            <strong>{copy.questionGeneration.parameters}</strong>
            <dl>
              <div>
                <dt>{copy.questionGeneration.template}</dt>
                <dd>{question.aiGeneration.rule}</dd>
              </div>
              <div>
                <dt>{copy.questionGeneration.difficulty}</dt>
                <dd>
                  {
                    copy.questionGeneration.difficulties[
                      question.aiGeneration.difficulty
                    ]
                  }
                </dd>
              </div>
              <div>
                <dt>{copy.questionGeneration.recognizability}</dt>
                <dd>
                  {
                    copy.questionGeneration.recognizabilities[
                      question.aiGeneration.recognizability
                    ]
                  }
                </dd>
              </div>
            </dl>
          </div>
        )}

        <label className="question-type">
          {copy.editor.questionType}
          <Dropdown
            value={question.type}
            onChange={(event) =>
              changeQuestionType(event.target.value as GameQuestionType)
            }
          >
            <option value="standard">
              {copy.editor.questionTypes.standard}
            </option>
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
      </fieldset>

      <QuestionNavigation
        selectedIndex={selectedIndex}
        onSelect={onSelectQuestion}
      />
    </section>
  );
}

export { type QuestionEditorProps, QuestionEditor };
