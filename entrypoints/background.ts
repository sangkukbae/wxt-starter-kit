import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/sandbox';

import { messageBus } from '@lib/messaging/bus';
import { analyticsService } from '@lib/services/analytics';
import { scheduleSyncJob } from '@lib/services/sync';
import { storageManager } from '@lib/storage/manager';

export default defineBackground({
  type: 'module',
  main() {
    console.info('[wxt-starter] service worker booted');

    browser.runtime.onInstalled.addListener(async (details) => {
      if (details.reason === 'install') {
        await storageManager.bootstrap();
        await analyticsService.track('extension_installed');
        await browser.tabs.create({
          url: browser.runtime.getURL('options/index.html#onboarding'),
        });
      }

      if (details.reason === 'update') {
        await storageManager.migrate(details.previousVersion ?? '0.0.0');
        await analyticsService.track('extension_updated', {
          from: details.previousVersion,
          to: browser.runtime.getManifest().version,
        });
      }
    });

    messageBus.register('settings:get', async () => {
      const preferences = await storageManager.get('user.preferences');
      return { preferences };
    });

    messageBus.register('settings:update', async ({ preferences }) => {
      await storageManager.set('user.preferences', preferences);
      await analyticsService.track('settings_updated');
      return { success: true } as const;
    });

    messageBus.register('settings.toggle', async ({ enabled }) => {
      await storageManager.set('extension.enabled', enabled);
      await analyticsService.track('extension_toggled', { enabled });
      return { enabled } as const;
    });

    messageBus.register('settings.sync', async () => {
      await analyticsService.track('settings_sync_requested');
      return { success: true } as const;
    });

    messageBus.register('stats.refresh', async () => {
      const state = await storageManager.get('extension.state');
      return {
        blocked: state?.blocked ?? 0,
        enhanced: state?.enhanced ?? 0,
      };
    });

    messageBus.register('options.open', async () => {
      await browser.runtime.openOptionsPage();
    });

    messageBus.register('activity.clear', async () => {
      await storageManager.set('activity.history', []);
      await analyticsService.track('activity_cleared');
    });

    messageBus.register('devtools.evaluate', async ({ code }) => {
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) {
        return { result: 'No active tab' } as const;
      }

      try {
        const [{ result }] = await browser.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (snippet: string) => {
            try {
              // eslint-disable-next-line no-eval
              return String(eval(snippet));
            } catch (error) {
              return `Execution error: ${error}`;
            }
          },
          args: [code],
        });
        return { result: String(result ?? 'No output') } as const;
      } catch (error) {
        return { result: `Failed to execute: ${error}` } as const;
      }
    });

    browser.contextMenus.create({
      id: 'wxt-starter-context',
      title: 'Send selection to WXT Starter',
      contexts: ['selection'],
    });

    browser.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId !== 'wxt-starter-context' || !tab?.id || !info.selectionText) {
        return;
      }

      await browser.tabs.sendMessage(tab.id, {
        topic: 'context.selection',
        payload: { text: info.selectionText },
      });

      const historyEntry = {
        timestamp: Date.now(),
        action: `Selection sent from ${tab.url}`,
      };

      await storageManager.update('activity.history', (draft) => {
        draft.unshift(historyEntry);
        if (draft.length > 50) draft.pop();
      });

      await browser.runtime.sendMessage({
        topic: 'activity.recorded',
        payload: historyEntry,
      });
    });

    scheduleSyncJob();
  },
});
