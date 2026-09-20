'use client';

import React from 'react';
import { useSync } from './SyncProvider';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SyncIndicator() {
  const { isOnline, isSyncing } = useSync();
  const t = useTranslations('Common');

  if (!isOnline) {
    return (
      <div className="flex items-center space-x-2 text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
        <WifiOff className="w-4 h-4" />
        <span>{t('offline')}</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center space-x-2 text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>{t('syncing')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
      <Wifi className="w-4 h-4" />
      <span>{t('online')}</span>
    </div>
  );
}
