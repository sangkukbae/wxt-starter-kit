import type { StorageValue } from '@lib/storage/schema';

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: T;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.example.com';

async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  async fetchPreferences() {
    return request<StorageValue<'user.preferences'>>('/preferences');
  },
  async savePreferences(payload: StorageValue<'user.preferences'>) {
    return request<void, StorageValue<'user.preferences'>>('/preferences', {
      method: 'PUT',
      body: payload,
    });
  },
};
