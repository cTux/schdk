import './styles.scss';

import { useEffect, useRef, useState } from 'react';
import { useLocalization } from '../../localization';
import {
  getQuestionDatabaseAnswer,
  QUESTION_DATABASE_ROW_HEIGHT,
} from './constants';
import type { QuestionDatabaseTableProps } from './types';

const OVERSCAN = 5;

export function QuestionDatabaseTable({
  ascending,
  rows,
  sort,
  onSelect,
  onSort,
}: QuestionDatabaseTableProps) {
  const { copy } = useLocalization();
  const databaseCopy = copy.questionDatabase;
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(520);
  const start = Math.min(
    rows.length,
    Math.max(
      0,
      Math.floor(scrollTop / QUESTION_DATABASE_ROW_HEIGHT) - OVERSCAN,
    ),
  );
  const count =
    Math.ceil(viewportHeight / QUESTION_DATABASE_ROW_HEIGHT) + OVERSCAN * 2;
  const end = Math.min(rows.length, start + count);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setViewportHeight(element.clientHeight),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setScrollTop(0);
    viewport.current?.scrollTo({ top: 0 });
  }, [rows]);

  return (
    <div
      ref={viewport}
      className="question-database-viewport"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <table>
        <thead>
          <tr>
            <th>
              <button
                type="button"
                aria-label={databaseCopy.sortQuestion}
                onClick={() => onSort('question')}
              >
                {databaseCopy.question}
                {sort === 'question' ? (ascending ? ' ↑' : ' ↓') : ''}
              </button>
            </th>
            <th>
              <button
                type="button"
                aria-label={databaseCopy.sortAnswer}
                onClick={() => onSort('answer')}
              >
                {databaseCopy.answer}
                {sort === 'answer' ? (ascending ? ' ↑' : ' ↓') : ''}
              </button>
            </th>
            <th>{databaseCopy.packages}</th>
          </tr>
        </thead>
        <tbody>
          {start > 0 && (
            <tr aria-hidden="true" className="question-database-spacer">
              <td
                colSpan={3}
                style={{ height: start * QUESTION_DATABASE_ROW_HEIGHT }}
              />
            </tr>
          )}
          {rows.slice(start, end).map((row) => (
            <tr
              key={`${row.fileId}-${row.number}`}
              className={onSelect ? 'question-database-selectable' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(row)}
              onKeyDown={(event) => {
                if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onSelect(row);
                }
              }}
            >
              <td>
                <span>{row.question}</span>
              </td>
              <td>
                <span>{getQuestionDatabaseAnswer(row)}</span>
              </td>
              <td>
                <span>{row.packageTitles.join(' · ')}</span>
              </td>
            </tr>
          ))}
          {end < rows.length && (
            <tr aria-hidden="true" className="question-database-spacer">
              <td
                colSpan={3}
                style={{
                  height: (rows.length - end) * QUESTION_DATABASE_ROW_HEIGHT,
                }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
