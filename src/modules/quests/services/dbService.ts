/**
 * dbService.ts
 * A lightweight IndexedDB wrapper for high-performance data storage
 * Use this to store large datasets (e.g. 8,500+ restaurants) locally
 */

export interface DBConfig {
  dbName: string;
  storeName: string;
  version: number;
}

const CONFIG: DBConfig = {
  dbName: 'RestaurantBlogDB',
  storeName: 'restaurants',
  version: 1,
};

/**
 * Initialize (and upgrade) the database
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONFIG.dbName, CONFIG.version);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CONFIG.storeName)) {
        db.createObjectStore(CONFIG.storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save multiple items to the database
 */
export const saveItems = async <T extends { id: string }>(items: T[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONFIG.storeName, 'readwrite');
    const store = transaction.objectStore(CONFIG.storeName);

    items.forEach((item) => {
      store.put(item);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

/**
 * Retrieve all items from the database
 */
export const getAllItems = async <T>(): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONFIG.storeName, 'readonly');
    const store = transaction.objectStore(CONFIG.storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear all items from the store
 */
export const clearStore = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONFIG.storeName, 'readwrite');
    const store = transaction.objectStore(CONFIG.storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Count items in the store
 */
export const getCount = async (): Promise<number> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CONFIG.storeName, 'readonly');
    const store = transaction.objectStore(CONFIG.storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
