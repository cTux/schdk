import { parseGamePackage } from '@schdk/common';
import {
  createQuestionDatabasePackage,
  flattenQuestionDatabase,
  type QuestionDatabaseDocument,
  type QuestionDatabaseEntry,
  type QuestionDatabasePackage,
} from '@schdk/google-drive';
import { useCallback, useEffect, useRef, useState } from 'react';

const PACKAGE_LOAD_CONCURRENCY = 4;
import type { GoogleDriveBridge } from '../../types/google-drive/google-drive-types';

const EMPTY_DATABASE: QuestionDatabaseDocument = {
  schemaVersion: 1,
  packages: [],
};

export function useQuestionDatabase(
  bridge: GoogleDriveBridge | null,
  accountId?: string,
  enabled = true,
) {
  const documentRef = useRef<QuestionDatabaseDocument>(EMPTY_DATABASE);
  const entriesRef = useRef<QuestionDatabaseEntry[]>([]);
  const syncRef = useRef<Promise<QuestionDatabaseEntry[]> | null>(null);
  const accountRef = useRef(accountId);
  const accountRevisionRef = useRef(0);
  if (accountRef.current !== accountId) {
    accountRef.current = accountId;
    accountRevisionRef.current += 1;
  }
  const [entries, setEntries] = useState<QuestionDatabaseEntry[]>([]);
  const [loading, setLoading] = useState(
    Boolean(enabled && bridge && accountId),
  );
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const refresh = useCallback(async () => {
    if (!enabled || !bridge || !accountId) return [];
    if (syncRef.current) return syncRef.current;
    const activeAccount = accountId;
    const activeRevision = accountRevisionRef.current;
    const isActive = () =>
      accountRevisionRef.current === activeRevision &&
      accountRef.current === activeAccount;
    const sync = (async () => {
      if (isActive()) {
        setLoading(true);
        setFailed(false);
      }
      const files = await bridge.listGamePackages();
      if (!isActive()) return [];
      const stored = (await bridge.loadQuestionDatabase()) ?? EMPTY_DATABASE;
      if (!isActive()) return [];
      const previous = new Map(
        stored.packages.map((item) => [item.fileId, item]),
      );
      const packages: QuestionDatabasePackage[] = [];
      let partialFailure = false;
      let databaseChanged = files.length !== stored.packages.length;
      for (
        let offset = 0;
        offset < files.length;
        offset += PACKAGE_LOAD_CONCURRENCY
      ) {
        const batch = await Promise.all(
          files
            .slice(offset, offset + PACKAGE_LOAD_CONCURRENCY)
            .map(async (file): Promise<QuestionDatabasePackage | null> => {
              const existing = previous.get(file.id);
              if (existing?.modifiedTime === file.modifiedTime) return existing;
              try {
                const loaded = await bridge.loadGamePackage(file.id);
                if (!isActive()) return null;
                const gamePackage = await parseGamePackage(loaded.content);
                databaseChanged = true;
                return createQuestionDatabasePackage(file, gamePackage);
              } catch {
                partialFailure = true;
                return existing ?? null;
              }
            }),
        );
        if (!isActive()) return [];
        packages.push(...batch.filter((item) => item !== null));
        setProgress({
          current: Math.min(offset + batch.length, files.length),
          total: files.length,
        });
      }
      const document: QuestionDatabaseDocument = {
        schemaVersion: 1,
        packages,
      };
      if (!isActive()) return [];
      if (databaseChanged) {
        await bridge.saveQuestionDatabase(document);
      }
      const nextEntries = flattenQuestionDatabase(document);
      if (isActive()) {
        documentRef.current = document;
        entriesRef.current = nextEntries;
        setEntries(nextEntries);
        setFailed(partialFailure);
        setProgress({ current: files.length, total: files.length });
        setLoading(false);
      }
      return nextEntries;
    })().catch((error) => {
      if (isActive()) {
        setFailed(true);
        setLoading(false);
      }
      throw error;
    });
    syncRef.current = sync;
    try {
      return await sync;
    } finally {
      if (syncRef.current === sync) syncRef.current = null;
    }
  }, [accountId, bridge, enabled]);

  useEffect(() => {
    documentRef.current = EMPTY_DATABASE;
    entriesRef.current = [];
    syncRef.current = null;
    setEntries([]);
    setProgress({ current: 0, total: 0 });
    setFailed(false);
    setLoading(Boolean(enabled && bridge && accountId));
    if (enabled && bridge && accountId) void refresh().catch(() => undefined);
  }, [accountId, bridge, enabled, refresh]);

  return {
    entries,
    failed,
    loading,
    progress,
    refresh,
    getEntries: () => entriesRef.current,
    indexedPackageCount: documentRef.current.packages.length,
  };
}
