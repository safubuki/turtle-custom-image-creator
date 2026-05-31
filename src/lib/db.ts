// --- IndexedDB ラッパー ---
// 既存の仕組みを踏襲しつつ、型安全化と設定（APIキー）保存用ストアを追加。

const DB_NAME = 'TurtleCustomDB';
// settings ストア追加に伴いバージョンを 2 へ更新（onupgradeneeded で差分追加）
const DB_VERSION = 2;

export type StoreName = 'assets' | 'presets' | 'settings';

let dbPromise: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'id' });
      }
      // key-value 形式の設定ストア（APIキーなど）
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });

  // 失敗時は次回リトライできるようキャッシュを破棄
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
};

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const dbStore = {
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await initDB();
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    return requestToPromise<T[]>(store.getAll());
  },

  async get<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const db = await initDB();
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    return requestToPromise<T | undefined>(store.get(key));
  },

  async put<T>(storeName: StoreName, item: T): Promise<void> {
    const db = await initDB();
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    await requestToPromise(store.put(item));
  },

  async delete(storeName: StoreName, key: IDBValidKey): Promise<void> {
    const db = await initDB();
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    await requestToPromise(store.delete(key));
  },
};

// --- 設定（key-value）ヘルパー ---
interface SettingRecord {
  key: string;
  value: string;
}

export const settingsStore = {
  async get(key: string): Promise<string | null> {
    const record = await dbStore.get<SettingRecord>('settings', key);
    return record?.value ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    await dbStore.put<SettingRecord>('settings', { key, value });
  },

  async remove(key: string): Promise<void> {
    await dbStore.delete('settings', key);
  },
};
