import {
  parseAIQuestionsPackageArchive,
  serializeAIQuestionsPackage,
  type AIQuestionsPackage,
} from '@schdk/common';
import { createAIQuestionsPackageFilename } from '@schdk/google-drive';
import { useEffect, useState } from 'react';
import type { GoogleDriveBridge } from './google-drive-types';

interface StoredPackage {
  fileId: string;
  value: AIQuestionsPackage;
}

const sortItems = (items: StoredPackage[]) =>
  [...items].sort((left, right) =>
    left.value.name.localeCompare(right.value.name),
  );

export function useAIQuestionsPackages(
  bridge: GoogleDriveBridge | null,
  accountId?: string,
) {
  const [items, setItems] = useState<StoredPackage[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setItems([]);
    setFailed(false);
    setLoading(Boolean(bridge && accountId));
    if (!bridge || !accountId) return;
    void bridge
      .listAIQuestionsPackages()
      .then((files) =>
        Promise.all(
          files.map(async ({ id }) => {
            try {
              const file = await bridge.loadAIQuestionsPackage(id);
              return {
                fileId: id,
                value: parseAIQuestionsPackageArchive(file.content),
              };
            } catch {
              return null;
            }
          }),
        ),
      )
      .then((loaded) => {
        if (!active) return;
        setFailed(loaded.some((item) => item === null));
        setItems(
          sortItems(
            loaded.filter((item): item is StoredPackage => item !== null),
          ),
        );
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accountId, bridge]);

  async function addPackage(value: AIQuestionsPackage) {
    if (!bridge) return false;
    try {
      const file = await bridge.createAIQuestionsPackage({
        name: createAIQuestionsPackageFilename(value.name),
        content: serializeAIQuestionsPackage(value),
      });
      setItems((current) =>
        sortItems([...current, { fileId: file.id, value }]),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function updatePackage(index: number, value: AIQuestionsPackage) {
    const item = items[index];
    if (!bridge || !item) return false;
    try {
      await bridge.updateAIQuestionsPackage(item.fileId, {
        name: createAIQuestionsPackageFilename(value.name),
        content: serializeAIQuestionsPackage(value),
      });
      setItems((current) =>
        sortItems(
          current.map((stored) =>
            stored.fileId === item.fileId ? { ...stored, value } : stored,
          ),
        ),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function removePackage(index: number) {
    const item = items[index];
    if (!bridge || !item) return false;
    try {
      await bridge.deleteAIQuestionsPackage(item.fileId);
      setItems((current) =>
        current.filter(({ fileId }) => fileId !== item.fileId),
      );
      return true;
    } catch {
      return false;
    }
  }

  return {
    packages: items.map(({ value }) => value),
    failed,
    loading,
    addPackage,
    updatePackage,
    removePackage,
  };
}
