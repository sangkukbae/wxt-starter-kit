import { describe, it, expect, vi, beforeEach } from 'vitest';

import { messageBus } from '@lib/messaging/bus';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('messageBus', () => {
  it('invokes registered handler and returns response', async () => {
    messageBus.register('settings.sync', async () => ({ success: true }));

    const response = await messageBus.emit('settings.sync');

    expect(response).toEqual({ success: true });
  });
});
