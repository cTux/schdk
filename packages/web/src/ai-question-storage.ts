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

function sortItems(items: StoredAIQuestion[]) {
  return [...items].sort((left, right) =>
    left.question.name.localeCompare(right.question.name),
  );
}

function useAIQuestionCollection(
  bridge: GoogleDriveBridge | null,
  accountId?: string,
  global = false,
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
    void (global ? bridge.listGlobalAIQuestions() : bridge.listAIQuestions())
      .then((files) =>
        Promise.all(
          files.map(async ({ id }) => {
            try {
              const file = await (global
                ? bridge.loadGlobalAIQuestion(id)
                : bridge.loadAIQuestion(id));
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
            sortItems(
              loaded.filter((item): item is StoredAIQuestion => item !== null),
            ),
          );
        }
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accountId, bridge, global]);

  async function addQuestion(question: AIQuestion): Promise<boolean> {
    if (!bridge) return false;
    try {
      const value = {
        name: createAIQuestionFilename(question.name),
        content: serializeAIQuestion(question),
      };
      const file = await (global
        ? bridge.createGlobalAIQuestion(value)
        : bridge.createAIQuestion(value));
      if (global && question.generalRule) {
        await clearGeneralRules(file.id);
      }
      setItems((current) =>
        sortItems([...current, { fileId: file.id, question }]),
      );
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
      const value = {
        name: createAIQuestionFilename(question.name),
        content: serializeAIQuestion(question),
      };
      await (global
        ? bridge.updateGlobalAIQuestion(item.fileId, value)
        : bridge.updateAIQuestion(item.fileId, value));
      if (global && question.generalRule) {
        await clearGeneralRules(item.fileId);
      }
      setItems((current) =>
        sortItems(
          current.map((stored) =>
            stored.fileId === item.fileId ? { ...stored, question } : stored,
          ),
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
      await (global
        ? bridge.deleteGlobalAIQuestion(item.fileId)
        : bridge.deleteAIQuestion(item.fileId));
      setItems((current) =>
        current.filter(({ fileId }) => fileId !== item.fileId),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function clearGeneralRules(exceptFileId?: string) {
    if (!bridge) return;
    await Promise.all(
      items
        .filter(
          ({ fileId, question }) =>
            fileId !== exceptFileId && question.generalRule,
        )
        .map(({ fileId, question }) =>
          bridge.updateGlobalAIQuestion(fileId, {
            name: createAIQuestionFilename(question.name),
            content: serializeAIQuestion({ ...question, generalRule: false }),
          }),
        ),
    );
    setItems((current) =>
      current.map((stored) =>
        stored.fileId !== exceptFileId && stored.question.generalRule
          ? {
              ...stored,
              question: { ...stored.question, generalRule: false },
            }
          : stored,
      ),
    );
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

export function useAIQuestions(
  bridge: GoogleDriveBridge | null,
  accountId?: string,
) {
  return {
    personal: useAIQuestionCollection(bridge, accountId),
    global: useAIQuestionCollection(bridge, accountId, true),
  };
}
