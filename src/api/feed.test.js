import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { setAccessToken } from './tokens';
import { listarFeed } from './feed';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  setAccessToken('acc');
  fetchMock = instalarFetch();
  fetchMock.mockImplementation(async () => json(200, { results: [] }));
});

afterEach(() => vi.unstubAllGlobals());

describe('api/feed', () => {
  it('consulta o feed autenticado', async () => {
    await listarFeed(2);

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/feed/?page=2');
    expect(opcoes.headers.Authorization).toBe('Bearer acc');
  });
});
