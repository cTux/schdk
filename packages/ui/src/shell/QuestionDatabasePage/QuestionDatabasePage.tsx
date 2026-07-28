import './styles.scss';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import type { QuestionDatabasePageProps, QuestionDatabaseRow } from './types';

const BATCH_SIZE = 100;
const ROW_HEIGHT = 76;
const VIEWPORT_HEIGHT = 520;
const OVERSCAN = 5;
type SearchField = 'all' | 'question' | 'answer';
type SortKey = 'question' | 'answer';

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim();
}

function getAnswerText(row: QuestionDatabaseRow) {
  return [row.answer, ...row.alternativeAnswers].join(' · ');
}

export function QuestionDatabasePage({
  failed,
  hidden,
  loading,
  progress,
  rows,
}: QuestionDatabasePageProps) {
  const { copy, locale } = useLocalization();
  const databaseCopy = copy.questionDatabase;
  const viewport = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [field, setField] = useState<SearchField>('all');
  const [sort, setSort] = useState<SortKey>('question');
  const [ascending, setAscending] = useState(true);
  const [limit, setLimit] = useState(BATCH_SIZE);
  const [scrollTop, setScrollTop] = useState(0);
  const filteredRows = useMemo(() => {
    const needle = normalize(deferredQuery);
    const result = needle
      ? rows.filter((row) => {
          const question = normalize(row.question);
          const answer = normalize(getAnswerText(row));
          return field === 'question'
            ? question.includes(needle)
            : field === 'answer'
              ? answer.includes(needle)
              : question.includes(needle) || answer.includes(needle);
        })
      : [...rows];
    return result.sort((left, right) => {
      const comparison =
        sort === 'question'
          ? left.question.localeCompare(right.question, locale)
          : getAnswerText(left).localeCompare(getAnswerText(right), locale);
      return ascending ? comparison : -comparison;
    });
  }, [ascending, deferredQuery, field, locale, rows, sort]);
  const loadedRows = filteredRows.slice(0, limit);
  const start = Math.min(
    loadedRows.length,
    Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN),
  );
  const count = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
  const end = Math.min(loadedRows.length, start + count);
  const visibleRows = loadedRows.slice(start, end);

  useEffect(() => {
    setLimit(BATCH_SIZE);
    setScrollTop(0);
    viewport.current?.scrollTo({ top: 0 });
  }, [deferredQuery, field, sort, ascending]);

  function changeSort(nextSort: SortKey) {
    if (sort === nextSort) setAscending((value) => !value);
    else {
      setSort(nextSort);
      setAscending(true);
    }
  }

  return (
    <section className="question-database-page" hidden={hidden}>
      <header>
        <h1>{databaseCopy.title}</h1>
        <p>{databaseCopy.description}</p>
      </header>
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
            onChange={(event) => setField(event.target.value as SearchField)}
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
      <div
        ref={viewport}
        className="question-database-viewport"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <table>
          <thead>
            <tr>
              <th>{databaseCopy.package}</th>
              <th>{databaseCopy.number}</th>
              <th>
                <button
                  type="button"
                  aria-label={databaseCopy.sortQuestion}
                  onClick={() => changeSort('question')}
                >
                  {databaseCopy.question}
                  {sort === 'question' ? (ascending ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  aria-label={databaseCopy.sortAnswer}
                  onClick={() => changeSort('answer')}
                >
                  {databaseCopy.answer}
                  {sort === 'answer' ? (ascending ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {start > 0 && (
              <tr aria-hidden="true" className="question-database-spacer">
                <td colSpan={4} style={{ height: start * ROW_HEIGHT }} />
              </tr>
            )}
            {visibleRows.map((row) => (
              <tr key={`${row.fileId}-${row.number}`}>
                <td>
                  <span>{row.packageTitle}</span>
                </td>
                <td>
                  <span>{row.number}</span>
                </td>
                <td>
                  <span>{row.question}</span>
                </td>
                <td>
                  <span>{getAnswerText(row)}</span>
                </td>
              </tr>
            ))}
            {end < loadedRows.length && (
              <tr aria-hidden="true" className="question-database-spacer">
                <td
                  colSpan={4}
                  style={{ height: (loadedRows.length - end) * ROW_HEIGHT }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
    </section>
  );
}
