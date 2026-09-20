import { getPendingOperations, updateOperationStatus, clearSyncedOperations } from './syncQueue';

let syncInProgress = false;

export async function pushSyncOperations() {
  if (syncInProgress || typeof window === 'undefined') return;
  if (!navigator.onLine) return;

  const pendingOps = await getPendingOperations();
  if (pendingOps.length === 0) return;

  syncInProgress = true;
  try {
    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: pendingOps })
    });

    if (!response.ok) {
      throw new Error('Sync push failed');
    }

    const result = await response.json();
    for (const res of result.results) {
      await updateOperationStatus(res.operationId, res.status, res.error);
    }
    await clearSyncedOperations();
  } catch (err) {
    console.error('Failed to push sync operations:', err);
  } finally {
    syncInProgress = false;
  }
}

export async function pullServerChanges() {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  try {
    const { getDB } = await import('../idb/db');
    const db = await getDB();
    if (!db) return;

    const meta = await db.get('syncMetadata', 'lastSync');
    const since = meta?.lastSuccessfulSyncAt || 0;

    const response = await fetch(`/api/sync/pull?since=${since}`);
    if (!response.ok) return;

    const data = await response.json();
    
    // Store pulled data into IndexedDB
    const tx = db.transaction(['bookings', 'procurements', 'syncMetadata'], 'readwrite');
    for (const booking of data.bookings || []) {
      await tx.objectStore('bookings').put(booking);
    }
    for (const procurement of data.procurements || []) {
      await tx.objectStore('procurements').put(procurement);
    }
    
    await tx.objectStore('syncMetadata').put({
      key: 'lastSync',
      lastSuccessfulSyncAt: Date.now()
    });

    await tx.done;
  } catch (err) {
    console.error('Failed to pull server changes:', err);
  }
}

export function startSyncManager() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      pushSyncOperations();
      pullServerChanges();
    });

    // Periodic sync attempt every 60 seconds
    setInterval(() => {
      pushSyncOperations();
      pullServerChanges();
    }, 60000);
  }
}
