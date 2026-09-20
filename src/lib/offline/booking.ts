import { getDB } from '../idb/db';
import { getCentres, getSlots, createBooking } from '@/app/actions/booking';
import { enqueueSyncOperation } from '../sync/syncQueue';

export async function getCentresOffline() {
  if (typeof window !== 'undefined' && navigator.onLine) {
    const centres = await getCentres();
    try {
      const db = await getDB();
      if (db) {
        // Clear stale cache before writing fresh data
        const tx = db.transaction('centres', 'readwrite');
        await tx.store.clear();
        for (const c of centres) {
          tx.store.put({ ...c, _id: c.id });
        }
        await tx.done;
      }
    } catch (e) {
      console.error("Failed to cache centres offline:", e);
    }
    return centres;
  }

  // Offline fallback
  try {
    const db = await getDB();
    if (db) {
      return await db.getAll('centres');
    }
  } catch (e) {
    console.error("Failed to read centres from offline DB:", e);
  }
  return [];
}

export async function getSlotsOffline(centreId: string, dateStr: string) {
  if (typeof window !== 'undefined' && navigator.onLine) {
    const slots = await getSlots(centreId, dateStr);
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction('slots', 'readwrite');
        for (const s of slots) {
          tx.store.put({ ...s, _id: s.id, centreId, dateStr });
        }
      }
    } catch (e) {
      console.error("Failed to cache slots offline:", e);
    }
    return slots;
  }

  // Offline fallback
  try {
    const db = await getDB();
    if (db) {
      const allSlots = await db.getAll('slots');
      return allSlots.filter(s => s.centreId === centreId && s.dateStr === dateStr);
    }
  } catch (e) {
    console.error("Failed to read slots from offline DB:", e);
  }
  return [];
}

export async function createBookingOffline(slotId: string, centreId: string, dateStr: string) {
  const operationId = 'op_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  
  if (typeof window !== 'undefined' && navigator.onLine) {
    const result = await createBooking(slotId, centreId, dateStr, operationId);
    
    if (result && (result as any).error) {
      throw new Error((result as any).error);
    }

    // Save locally
    const db = await getDB();
    if (db) {
      await db.put('bookings', result);
    }
    return result;
  }

  // Offline: queue it up
  const payload = { slotId, centreId, date: dateStr };
  await enqueueSyncOperation(operationId, 'CREATE', 'BOOKING', payload);
  
  const optimisticBooking = {
    _id: operationId,
    tokenNumber: `TKN-${Math.floor(1000 + Math.random() * 9000)} (Offline)`,
    queuePosition: 'Pending',
    date: dateStr,
    status: 'SCHEDULED',
    isOffline: true
  };

  const db = await getDB();
  if (db) {
    await db.put('bookings', optimisticBooking);
  }

  return optimisticBooking;
}
