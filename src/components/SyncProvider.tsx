'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { startSyncManager } from '@/lib/sync/syncManager';

type SyncContextType = {
  isOnline: boolean;
  isSyncing: boolean;
};

const SyncContext = createContext<SyncContextType>({ isOnline: true, isSyncing: false });

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Start the manager
    startSyncManager();

    // Hook into sync manager events or just mock sync state for now based on simple timeouts or events
    // Ideally syncManager emits events when syncing starts/stops.
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
