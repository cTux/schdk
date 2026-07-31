import './styles.scss';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import {
  QuestionDatabaseTable,
  searchQuestionDatabaseRows,
  sortQuestionDatabaseRows,
  type QuestionDatabaseSearchField,
  type QuestionDatabaseSort,
} from '../../question-database';
import { Page } from '../Page';
import type { QuestionDatabasePageProps } from './types';

const BATCH_SIZE = 100;

export function QuestionDatabasePage({
  failed,
  hidden,
  loading,
  onBack,
  progress,
  rows,
}: QuestionDatabasePageProps) {
  const { copy, locale } = useLocalization();
  const databaseCopy = copy.questionDatabase;
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [field, setField] = useState<QuestionDatabaseSearchField>('all');
  const [sort, setSort] = useState<QuestionDatabaseSort>('question');
  const [ascending, setAscending] = useState(true);
  const [limit, setLimit] = useState(BATCH_SIZE);
  const filteredRows = useMemo(() => {
    const result = searchQuestionDatabaseRows(rows, deferredQuery, field);
    return sortQuestionDatabaseRows(result, sort, ascending, locale);
  }, [ascending, deferredQuery, field, locale, rows, sort]);
  const loadedRows = useMemo(
    () => filteredRows.slice(0, limit),
    [filteredRows, limit],
  );

  useEffect(() => {
    setLimit(BATCH_SIZE);
  }, [deferredQuery, field, sort, ascending]);

  function changeSort(nextSort: QuestionDatabaseSort) {
    if (sort === nextSort) setAscending((value) => !value);
    else {
      setSort(nextSort);
      setAscending(true);
    }
  }

  return (
    <Page
      className="question-database-page"
      hidden={hidden}
      title={databaseCopy.title}
      headerContent={<p>{databaseCopy.description}</p>}
      onBack={onBack}
    >
      <div className="question-database-filters">
        <label>
          {databaseCopy.search}
          <Input
            type="search"
            value={query}
            placeholder={databaseCopy.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          {databaseCopy.searchField}
          <Dropdown
            value={field}
            onChange={(event) =>
              setField(event.target.value as QuestionDatabaseSearchField)
            }
          >
            <option value="all">{databaseCopy.fields.all}</option>
            <option value="question">{databaseCopy.fields.question}</option>
            <option value="answer">{databaseCopy.fields.answer}</option>
          </Dropdown>
        </label>
      </div>
      {loading && (
        <p role="status">
          {databaseCopy.loading(progress.current, progress.total)}
        </p>
      )}
      {failed && (
        <p className="question-database-error">{databaseCopy.failed}</p>
      )}
      <QuestionDatabaseTable
        ascending={ascending}
        rows={loadedRows}
        sort={sort}
        onSort={changeSort}
      />
      {!loading && filteredRows.length === 0 && (
        <p className="question-database-empty">{databaseCopy.empty}</p>
      )}
      <footer>
        <span>
          {databaseCopy.showing(loadedRows.length, filteredRows.length)}
        </span>
        {loadedRows.length < filteredRows.length && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLimit((value) => value + BATCH_SIZE)}
          >
            {databaseCopy.loadMore}
          </Button>
        )}
      </footer>
    </Page>
  );
}
