import './styles.scss';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { faPaste } from '@fortawesome/free-solid-svg-icons/faPaste';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';
import { useDeferredValue, useMemo, useState } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import {
  QuestionDatabaseTable,
  searchQuestionDatabaseRows,
  sortQuestionDatabaseRows,
  type QuestionDatabaseSort,
} from '../../question-database';
import { QuestionGenerationDialog } from '../QuestionGenerationDialog';
import { type QuestionEditorHeaderProps } from './question-editor-header-props';

function QuestionEditorHeader({
  aiGeneration,
  questionDatabaseRows,
  questionNumber,
  onDatabaseQuestionSelect,
  onGenerated,
  onClear,
  onCopy,
  onPaste,
}: QuestionEditorHeaderProps) {
  const { copy, locale } = useLocalization();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sort, setSort] = useState<QuestionDatabaseSort>('question');
  const [ascending, setAscending] = useState(true);
  const results = useMemo(
    () =>
      sortQuestionDatabaseRows(
        searchQuestionDatabaseRows(questionDatabaseRows, deferredQuery),
        sort,
        ascending,
        locale,
      ),
    [ascending, deferredQuery, locale, questionDatabaseRows, sort],
  );

  function changeSort(nextSort: QuestionDatabaseSort) {
    if (sort === nextSort) setAscending((value) => !value);
    else {
      setSort(nextSort);
      setAscending(true);
    }
  }

  return (
    <>
      <div className="question-heading">
        <h2>{copy.shared.questionNumber(questionNumber)}</h2>
        <Input
          type="search"
          minLength={2}
          value={query}
          aria-label={copy.questionDatabase.search}
          placeholder={copy.questionDatabase.questionSearchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="question-clipboard-actions">
          {aiGeneration && (
            <QuestionGenerationDialog
              {...aiGeneration}
              onGenerated={onGenerated}
            />
          )}
          <IconButton
            icon={faCopy}
            label={copy.editor.copyQuestion}
            onClick={onCopy}
          />
          <IconButton
            icon={faPaste}
            label={copy.editor.pasteQuestion}
            onClick={onPaste}
          />
          <IconButton
            icon={faTrashCan}
            label={copy.shared.remove}
            onClick={onClear}
            variant="danger"
          />
        </div>
      </div>
      {deferredQuery.trim().length >= 2 && (
        <QuestionDatabaseTable
          ascending={ascending}
          rows={results}
          sort={sort}
          onSort={changeSort}
          onSelect={(row) => {
            void onDatabaseQuestionSelect(row).then((selected) => {
              if (selected) setQuery('');
            });
          }}
        />
      )}
    </>
  );
}

export { type QuestionEditorHeaderProps, QuestionEditorHeader };
