import './styles.scss';

import {
  faLock,
  faPen,
  faStar,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import type { AIQuestionCardProps } from './types';

export function AIQuestionCard({
  question,
  onDelete,
  onEdit,
  onUpdate,
  onSaveFailed,
}: AIQuestionCardProps) {
  const { copy } = useLocalization();
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<boolean>) {
    setPending(true);
    const saved = await action().catch(() => false);
    setPending(false);
    if (!saved) onSaveFailed();
  }

  return (
    <article className="ai-question-card">
      <header>
        <h2>{question.name}</h2>
      </header>
      <div className="ai-question-card-body">
        <p>{question.description}</p>
      </div>
      {onUpdate && onEdit && onDelete && (
        <div className="ai-question-card-actions">
          {question.generalRule ? (
            <IconButton
              disabled
              icon={faLock}
              label={copy.aiQuestions.generalRule}
            />
          ) : (
            <IconButton
              className="ai-question-favorite"
              aria-pressed={question.favorite}
              disabled={pending}
              icon={faStar}
              label={
                question.favorite
                  ? copy.aiQuestions.removeFavorite
                  : copy.aiQuestions.favorite
              }
              onClick={() =>
                void run(() =>
                  onUpdate({ ...question, favorite: !question.favorite }),
                )
              }
            />
          )}
          <IconButton
            disabled={pending}
            icon={faPen}
            label={copy.aiQuestions.edit}
            onClick={onEdit}
          />
          <IconButton
            disabled={pending}
            icon={faTrashCan}
            label={copy.aiQuestions.delete}
            onClick={() => void run(onDelete)}
          />
        </div>
      )}
    </article>
  );
}
