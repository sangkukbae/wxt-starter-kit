import { describe, it, expect, beforeEach, vi } from 'vitest';

import { storageManager } from '@lib/storage/manager';
import { StorageSchema } from '@lib/storage/schema';

const mockStorage = new Map<string, unknown>();

globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
        if (!keys) {
          const result: Record<string, unknown> = {};
          mockStorage.forEach((value, key) => {
            result[key] = value;
          });
          return result;
        }
        if (typeof keys === 'string') {
          return { [keys]: mockStorage.get(keys) };
        }
        throw new Error('Unsupported get signature');
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.entries(items).forEach(([key, value]) => mockStorage.set(key, value));
      }),
      remove: vi.fn(async (key: string) => {
        mockStorage.delete(key);
      }),
    },
  },
  runtime: {
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
  },
  alarms: {
    create: vi.fn(),
    onAlarm: { addListener: vi.fn() },
  },
} as unknown as typeof chrome;

describe('storageManager', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('bootstrap seeds defaults', async () => {
    await storageManager.bootstrap();
    await Promise.all(
      (Object.keys(StorageSchema) as Array<keyof typeof StorageSchema>).map(async (key) => {
        const value = await storageManager.get(key);
        expect(value).toBeDefined();
      }),
    );
  });

  it('set and get maintain values', async () => {
    await storageManager.set('extension.enabled', true);
    expect(await storageManager.get('extension.enabled')).toBe(true);
  });
});
