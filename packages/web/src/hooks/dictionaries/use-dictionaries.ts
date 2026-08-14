import {
  DEFAULT_SCHDK_DICTIONARIES,
  parseSchdkDictionaryArchive,
  type SchdkDictionary,
} from '@schdk/common';
import { createDictionaryFilename } from '@schdk/google-drive';
import { useEffect, useState } from 'react';
import type { DriveDictionaryStorage } from '@schdk/google-drive';
import type { GoogleDriveConnection } from '../../types/google-drive/google-drive-types';

interface StoredDictionary {
  fileId?: string;
  dictionary: SchdkDictionary;
}

export function useDictionaries(
  bridge: DriveDictionaryStorage | null,
  connection: GoogleDriveConnection,
  enabled = true,
) {
  const accountId =
    connection.state === 'connected'
      ? connection.account.emailAddress
      : undefined;
  const isAdmin = false;
  const [items, setItems] = useState<StoredDictionary[]>(() =>
    DEFAULT_SCHDK_DICTIONARIES.map((dictionary) => ({ dictionary })),
  );
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(Boolean(enabled && bridge && accountId));
    setFailed(false);
    if (!enabled || !bridge || !accountId) return;
    void bridge
      .listDictionaries()
      .then(async (files) => {
        const loaded = await Promise.all(
          DEFAULT_SCHDK_DICTIONARIES.map(async (fallback) => {
            const file = files.find(
              ({ name }) => name === createDictionaryFilename(fallback.id),
            );
            if (!file) return { dictionary: fallback };
            try {
              const value = await bridge.loadDictionary(file.id);
              return {
                fileId: file.id,
                dictionary: parseSchdkDictionaryArchive(value.content),
              };
            } catch {
              return { fileId: file.id, dictionary: fallback, failed: true };
            }
          }),
        );
        if (!active) return;
        setItems(
          loaded.map(({ fileId, dictionary }) => ({ fileId, dictionary })),
        );
        setFailed(loaded.some((item) => item.failed));
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accountId, bridge, enabled]);

  async function updateDictionary(dictionary: SchdkDictionary) {
    void dictionary;
    return false;
  }

  return {
    dictionaries: items.map(({ dictionary }) => dictionary),
    failed,
    loading,
    isAdmin,
    updateDictionary,
  };
}
