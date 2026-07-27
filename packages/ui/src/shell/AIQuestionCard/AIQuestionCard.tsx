import './styles.scss';

import {
  faEye,
  faEyeSlash,
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
    <article
      className="ai-question-card"
      data-disabled={question.enabled ? undefined : true}
    >
      <header>
        <h2>{question.name}</h2>
      </header>
      <div className="ai-question-card-body">
        <p>{question.description}</p>
        {question.goodExamples && (
          <section>
            <h3>{copy.aiQuestions.goodExamples}</h3>
            <p>{question.goodExamples}</p>
          </section>
        )}
        {question.badExamples && (
          <section>
            <h3>{copy.aiQuestions.badExamples}</h3>
            <p>{question.badExamples}</p>
          </section>
        )}
      </div>
      <div className="ai-question-card-actions">
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
        <IconButton
          disabled={pending}
          icon={faPen}
          label={copy.aiQuestions.edit}
          onClick={onEdit}
        />
        <IconButton
          aria-pressed={question.enabled}
          disabled={pending}
          icon={question.enabled ? faEye : faEyeSlash}
          label={
            question.enabled
              ? copy.aiQuestions.disable
              : copy.aiQuestions.enable
          }
          onClick={() =>
            void run(() =>
              onUpdate({ ...question, enabled: !question.enabled }),
            )
          }
        />
        <IconButton
          disabled={pending}
          icon={faTrashCan}
          label={copy.aiQuestions.delete}
          onClick={() => void run(onDelete)}
        />
      </div>
    </article>
  );
}
