import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface MandiSetuDB extends DBSchema {
  auth_session: {
    key: string;
    value: { id: string; user: any; expiresAt: number };
  };
  syncQueue: {
    key: string;
    value: {
      operationId: string;
      operation: 'CREATE' | 'UPDATE' | 'DELETE';
      entity: string;
      payload: any;
      createdAt: number;
      retryCount: number;
      status: 'PENDING' | 'FAILED' | 'SYNCED';
      lastError?: string;
    };
    indexes: { 'by-status': string };
  };
  syncMetadata: {
    key: string;
    value: {
      key: string;
      lastSuccessfulSyncAt: number;
    };
  };
  bookings: {
    key: string;
    value: any;
    indexes: { 'by-farmer': string };
  };
  procurements: {
    key: string;
    value: any;
    indexes: { 'by-worker': string };
  };
  slots: {
    key: string;
    value: any;
  };
  centres: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'mandi-setu-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MandiSetuDB>> | null = null;

export async function getDB() {
  if (!dbPromise) {
    if (typeof window === 'undefined') {
      return null;
    }
    dbPromise = openDB<MandiSetuDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('auth_session')) {
          db.createObjectStore('auth_session', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'operationId' });
          syncQueueStore.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('syncMetadata')) {
          db.createObjectStore('syncMetadata', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingsStore = db.createObjectStore('bookings', { keyPath: '_id' });
          bookingsStore.createIndex('by-farmer', 'farmerId');
        }
        if (!db.objectStoreNames.contains('procurements')) {
          const procurementsStore = db.createObjectStore('procurements', { keyPath: '_id' });
          procurementsStore.createIndex('by-worker', 'workerId');
        }
        if (!db.objectStoreNames.contains('slots')) {
          db.createObjectStore('slots', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('centres')) {
          db.createObjectStore('centres', { keyPath: '_id' });
        }
      },
    });
  }
  return dbPromise;
}
