import { ShoppingList, ShoppingItem } from '../types';
import { generateUUID } from './uuid';

export type OfflineMutationType =
  | 'CREATE_LIST'
  | 'UPDATE_LIST'
  | 'DELETE_LIST'
  | 'ADD_ITEM'
  | 'UPDATE_ITEM'
  | 'DELETE_ITEM'
  | 'COMPLETE_ITEM'
  | 'UNCOMPLETE_ITEM'
  | 'SAVE_LIST'; // General idempotent list upsert

export interface PendingOfflineOperation {
  id: string;
  type: OfflineMutationType;
  userId: string;
  listId: string;
  itemId?: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  syncStatus: 'pending' | 'syncing' | 'failed';
}

const DB_NAME = 'yaad_pwa_offline_db';
const DB_VERSION = 1;

const STORES = {
  LISTS: 'shopping_lists',
  QUEUE: 'offline_queue',
  METADATA: 'app_metadata',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or upgrade the YAAD IndexedDB instance
 */
export function getOfflineDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Shopping Lists store
          if (!db.objectStoreNames.contains(STORES.LISTS)) {
            const listsStore = db.createObjectStore(STORES.LISTS, { keyPath: 'id' });
            listsStore.createIndex('by_user', 'userId', { unique: false });
            listsStore.createIndex('by_updated', 'updated_at', { unique: false });
            listsStore.createIndex('by_timestamp', 'createdTimestamp', { unique: false });
          }

          // 2. Offline Synchronization Queue store
          if (!db.objectStoreNames.contains(STORES.QUEUE)) {
            const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'id' });
            queueStore.createIndex('by_user', 'userId', { unique: false });
            queueStore.createIndex('by_timestamp', 'timestamp', { unique: false });
            queueStore.createIndex('by_list', 'listId', { unique: false });
          }

          // 3. Metadata store (e.g. sync timestamps, offline preferences)
          if (!db.objectStoreNames.contains(STORES.METADATA)) {
            db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('IndexedDB open error:', request.error);
          dbPromise = null;
          reject(request.error);
        };
      } catch (err) {
        dbPromise = null;
        reject(err);
      }
    });
  }

  return dbPromise;
}

// ============================================================================
// 1. SHOPPING LISTS OPERATIONS (INDEXEDDB)
// ============================================================================

/**
 * Retrieve all shopping lists for a specific user from IndexedDB
 */
export async function getOfflineLists(userId: string): Promise<ShoppingList[]> {
  try {
    const db = await getOfflineDB();
    return new Promise<ShoppingList[]>((resolve, reject) => {
      const transaction = db.transaction([STORES.LISTS], 'readonly');
      const store = transaction.objectStore(STORES.LISTS);
      const index = store.index('by_user');
      const request = index.getAll(IDBKeyRange.only(userId));

      request.onsuccess = () => {
        const results = (request.result || []) as ShoppingList[];
        // Sort descending by createdTimestamp
        results.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
        resolve(results);
      };

      request.onerror = () => {
        console.warn('Error fetching offline lists:', request.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable for getOfflineLists, falling back to empty array', err);
    return [];
  }
}

/**
 * Retrieve a single shopping list by ID for a user
 */
export async function getOfflineListById(userId: string, listId: string): Promise<ShoppingList | null> {
  try {
    const db = await getOfflineDB();
    return new Promise<ShoppingList | null>((resolve) => {
      const transaction = db.transaction([STORES.LISTS], 'readonly');
      const store = transaction.objectStore(STORES.LISTS);
      const request = store.get(listId);

      request.onsuccess = () => {
        const item = request.result as ShoppingList | undefined;
        if (item && item.userId === userId) {
          resolve(item);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Save or update a shopping list in IndexedDB
 */
export async function saveOfflineList(userId: string, list: ShoppingList): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.LISTS], 'readwrite');
      const store = transaction.objectStore(STORES.LISTS);

      const record: ShoppingList & { updated_at: string } = {
        ...list,
        userId,
        updated_at: new Date().toISOString(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveOfflineList error:', err);
  }
}

/**
 * Bulk save shopping lists into IndexedDB (e.g. after cloud fetch)
 */
export async function saveOfflineListsBatch(userId: string, lists: ShoppingList[]): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.LISTS], 'readwrite');
      const store = transaction.objectStore(STORES.LISTS);

      lists.forEach((list) => {
        const record = {
          ...list,
          userId,
          updated_at: new Date().toISOString(),
        };
        store.put(record);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveOfflineListsBatch error:', err);
  }
}

/**
 * Delete a shopping list from IndexedDB
 */
export async function deleteOfflineList(userId: string, listId: string): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.LISTS], 'readwrite');
      const store = transaction.objectStore(STORES.LISTS);

      // Verify ownership before deleting
      const getReq = store.get(listId);
      getReq.onsuccess = () => {
        const item = getReq.result as ShoppingList | undefined;
        if (item && item.userId === userId) {
          const delReq = store.delete(listId);
          delReq.onsuccess = () => resolve();
          delReq.onerror = () => reject(delReq.error);
        } else {
          resolve(); // Nothing to delete or owned by different user
        }
      };
      getReq.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB deleteOfflineList error:', err);
  }
}

/**
 * Clear all shopping lists for a user from IndexedDB
 */
export async function clearUserOfflineLists(userId: string): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.LISTS], 'readwrite');
      const store = transaction.objectStore(STORES.LISTS);
      const index = store.index('by_user');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB clearUserOfflineLists error:', err);
  }
}

// ============================================================================
// 2. OFFLINE MUTATIONS QUEUE OPERATIONS (INDEXEDDB)
// ============================================================================

/**
 * Enqueue a pending mutation into the offline synchronization queue
 */
export async function enqueueOfflineOperation(
  op: Omit<PendingOfflineOperation, 'id' | 'timestamp' | 'retryCount' | 'syncStatus'>
): Promise<PendingOfflineOperation> {
  const item: PendingOfflineOperation = {
    ...op,
    id: generateUUID(),
    timestamp: Date.now(),
    retryCount: 0,
    syncStatus: 'pending',
  };

  try {
    const db = await getOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);

      // Coalesce / deduplicate pending operations on the same list if safe
      if (item.type === 'DELETE_LIST') {
        // If deleting a list, delete any earlier pending saves for this list
        const index = store.index('by_list');
        const req = index.openCursor(IDBKeyRange.only(item.listId));
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            store.put(item);
          }
        };
      } else if (item.type === 'SAVE_LIST' || item.type === 'UPDATE_LIST') {
        // Replace previous pending SAVE_LIST for the same list to prevent duplicate syncing
        const index = store.index('by_list');
        const req = index.openCursor(IDBKeyRange.only(item.listId));
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            if (cursor.value.type === 'SAVE_LIST' || cursor.value.type === 'UPDATE_LIST') {
              cursor.delete();
            }
            cursor.continue();
          } else {
            store.put(item);
          }
        };
      } else {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB enqueue error, fallback:', err);
  }

  return item;
}

/**
 * Get all pending offline operations for a user, sorted chronologically
 */
export async function getPendingOfflineOperations(userId: string): Promise<PendingOfflineOperation[]> {
  try {
    const db = await getOfflineDB();
    return new Promise<PendingOfflineOperation[]>((resolve) => {
      const transaction = db.transaction([STORES.QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.QUEUE);
      const index = store.index('by_user');
      const request = index.getAll(IDBKeyRange.only(userId));

      request.onsuccess = () => {
        const ops = (request.result || []) as PendingOfflineOperation[];
        ops.sort((a, b) => a.timestamp - b.timestamp);
        resolve(ops);
      };

      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Get count of pending operations for a user
 */
export async function getPendingOperationsCount(userId: string): Promise<number> {
  const ops = await getPendingOfflineOperations(userId);
  return ops.length;
}

/**
 * Remove an operation from the queue once it has successfully synchronized to Supabase
 */
export async function removePendingOfflineOperation(id: string): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error removing pending operation:', err);
  }
}

/**
 * Update a pending operation (e.g. increment retryCount or record error)
 */
export async function updatePendingOperationStatus(
  id: string,
  updates: Partial<PendingOfflineOperation>
): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const current = getReq.result as PendingOfflineOperation | undefined;
        if (!current) return resolve();
        const updated = { ...current, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Error updating pending operation status:', err);
  }
}

/**
 * Clear the offline queue for a user
 */
export async function clearUserOfflineQueue(userId: string): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      const index = store.index('by_user');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error clearing user queue:', err);
  }
}

// ============================================================================
// 3. USER SECURITY PURGE (LOGOUT & ACCOUNT DELETION)
// ============================================================================

/**
 * Purges all private user data (shopping lists & queued mutations) from IndexedDB.
 * Enforces strict user isolation so another user logging into the same device
 * cannot access previous cached lists or offline mutations.
 */
export async function purgeAllUserOfflineData(userId: string): Promise<void> {
  if (!userId) return;
  await Promise.allSettled([
    clearUserOfflineLists(userId),
    clearUserOfflineQueue(userId),
  ]);
}

// ============================================================================
// 4. APPLICATION METADATA & PREFERENCES STORE
// ============================================================================

export async function setAppMetadata(key: string, value: any): Promise<void> {
  try {
    const db = await getOfflineDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(STORES.METADATA);
      const req = store.put({ key, value, updated_at: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage if needed
    try {
      localStorage.setItem(`yaad_meta_${key}`, JSON.stringify(value));
    } catch {}
  }
}

export async function getAppMetadata<T>(key: string): Promise<T | null> {
  try {
    const db = await getOfflineDB();
    return new Promise<T | null>((resolve) => {
      const transaction = db.transaction([STORES.METADATA], 'readonly');
      const store = transaction.objectStore(STORES.METADATA);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result?.value ?? null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    try {
      const raw = localStorage.getItem(`yaad_meta_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
