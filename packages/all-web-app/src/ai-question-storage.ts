import {
  parseAIQuestionArchive,
  serializeAIQuestion,
  type AIQuestion,
} from '@schdk/common';
import { createAIQuestionFilename } from '@schdk/google-drive';
import { useEffect, useState } from 'react';
import type { GoogleDriveBridge } from './google-drive-types';

interface StoredAIQuestion {
  fileId: string;
  question: AIQuestion;
}

export function useAIQuestions(
  bridge: GoogleDriveBridge | null,
  accountId?: string,
) {
  const [items, setItems] = useState<StoredAIQuestion[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setItems([]);
    setFailed(false);
    setLoading(Boolean(bridge && accountId));
    if (!bridge || !accountId) return;
    void bridge
      .listAIQuestions()
      .then((files) =>
        Promise.all(
          files.map(async ({ id }) => {
            try {
              const file = await bridge.loadAIQuestion(id);
              return {
                fileId: id,
                question: parseAIQuestionArchive(file.content),
              };
            } catch {
              return null;
            }
          }),
        ),
      )
      .then((loaded) => {
        if (active) {
          setFailed(loaded.some((item) => item === null));
          setItems(
            loaded.filter((item): item is StoredAIQuestion => item !== null),
          );
        }
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accountId, bridge]);

  async function addQuestion(question: AIQuestion): Promise<boolean> {
    if (!bridge) return false;
    try {
      const file = await bridge.createAIQuestion({
        name: createAIQuestionFilename(question.name),
        content: serializeAIQuestion(question),
      });
      setItems((current) => [{ fileId: file.id, question }, ...current]);
      return true;
    } catch {
      return false;
    }
  }

  async function updateQuestion(
    index: number,
    question: AIQuestion,
  ): Promise<boolean> {
    const item = items[index];
    if (!bridge || !item) return false;
    try {
      await bridge.updateAIQuestion(item.fileId, {
        name: createAIQuestionFilename(question.name),
        content: serializeAIQuestion(question),
      });
      setItems((current) =>
        current.map((stored) =>
          stored.fileId === item.fileId ? { ...stored, question } : stored,
        ),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function removeQuestion(index: number): Promise<boolean> {
    const item = items[index];
    if (!bridge || !item) return false;
    try {
      await bridge.deleteAIQuestion(item.fileId);
      setItems((current) =>
        current.filter(({ fileId }) => fileId !== item.fileId),
      );
      return true;
    } catch {
      return false;
    }
  }

  return {
    questions: items.map(({ question }) => question),
    loading,
    failed,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
}
