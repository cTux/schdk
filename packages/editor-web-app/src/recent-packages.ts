const DATABASE_NAME = 'schdk-editor';
const DATABASE_VERSION = 1;
const STORE_NAME = 'recent-packages';
const RECENT_LIMIT = 20;

interface RecentPackageRecord {
  name: string;
  title?: string;
  content: Uint8Array;
  openedAt: number;
}

export interface RecentPackage {
  id: string;
  name: string;
  title?: string;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve());
    transaction.addEventListener('abort', () => reject(transaction.error));
    transaction.addEventListener('error', () => reject(transaction.error));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener('upgradeneeded', () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'name' });
    });
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
  });
}

function sortRecentPackages(records: RecentPackageRecord[]) {
  return [...records].sort((left, right) => right.openedAt - left.openedAt);
}

export function selectRecentPackages(records: RecentPackageRecord[]) {
  return sortRecentPackages(records).slice(0, RECENT_LIMIT);
}

export async function listRecentWebPackages(): Promise<RecentPackage[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME);
    const records = await requestResult<RecentPackageRecord[]>(
      transaction.objectStore(STORE_NAME).getAll(),
    );
    return selectRecentPackages(records).map(({ name, title }) => ({
      id: name,
      name,
      ...(typeof title === 'string' ? { title } : {}),
    }));
  } finally {
    database.close();
  }
}

export async function rememberWebPackage(
  name: string,
  title: string,
  content: Uint8Array,
): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const done = transactionDone(transaction);
    const store = transaction.objectStore(STORE_NAME);
    store.put({ name, title, content, openedAt: Date.now() });
    const records = await requestResult<RecentPackageRecord[]>(store.getAll());
    for (const recent of sortRecentPackages(records).slice(RECENT_LIMIT)) {
      store.delete(recent.name);
    }
    await done;
  } finally {
    database.close();
  }
}

export async function loadRecentWebPackage(
  name: string,
): Promise<Uint8Array | null> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME);
    const record = await requestResult<RecentPackageRecord | undefined>(
      transaction.objectStore(STORE_NAME).get(name),
    );
    return record?.content instanceof Uint8Array ? record.content : null;
  } finally {
    database.close();
  }
}
