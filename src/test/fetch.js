import { vi } from 'vitest';

export function json(status, corpo) {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function instalarFetch() {
  const mock = vi.fn();
  vi.stubGlobal('fetch', mock);
  return mock;
}

export function ultimaChamada(mock) {
  const [url, opcoes] = mock.mock.calls.at(-1);
  return { url, opcoes };
}
