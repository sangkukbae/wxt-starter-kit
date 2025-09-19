import { browser } from 'wxt/browser';

import { analyticsService } from '@lib/services/analytics';
import { storageManager } from '@lib/storage/manager';

export function scheduleSyncJob(): void {
  browser.alarms.create('wxt-starter-sync', { periodInMinutes: 30 });
  browser.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
    if (alarm.name !== 'wxt-starter-sync') return;
    await runSyncCycle();
  });
}

export async function runSyncCycle(): Promise<void> {
  const enabled = await storageManager.get('extension.enabled');
  if (!enabled) return;

  await analyticsService.track('sync_cycle_started');

  const state = await storageManager.get('extension.state');
  await storageManager.set('extension.state', {
    blocked: (state?.blocked ?? 0) + Math.floor(Math.random() * 3),
    enhanced: (state?.enhanced ?? 0) + Math.floor(Math.random() * 2),
  });

  await analyticsService.track('sync_cycle_completed');
}
