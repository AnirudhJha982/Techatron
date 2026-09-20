import { getDB } from '../idb/db';

export async function enqueueSyncOperation(
  operationId: string,
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: string,
  payload: any
) {
  const db = await getDB();
  if (!db) return;

  await db.put('syncQueue', {
    operationId,
    operation,
    entity,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'PENDING'
  });
}

export async function getPendingOperations() {
  const db = await getDB();
  if (!db) return [];

  const tx = db.transaction('syncQueue', 'readonly');
  const index = tx.store.index('by-status');
  return await index.getAll('PENDING');
}

export async function updateOperationStatus(
  operationId: string,
  status: 'PENDING' | 'FAILED' | 'SYNCED',
  error?: string
) {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.store;
  const op = await store.get(operationId);
  if (op) {
    op.status = status;
    if (error) op.lastError = error;
    if (status === 'FAILED') op.retryCount += 1;
    await store.put(op);
  }
}

export async function clearSyncedOperations() {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction('syncQueue', 'readwrite');
  const index = tx.store.index('by-status');
  const syncedOps = await index.getAllKeys('SYNCED');
  for (const key of syncedOps) {
    await tx.store.delete(key);
  }
}
