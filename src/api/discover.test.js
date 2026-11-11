import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { descobrirFilmes, filmesEmAlta } from './discover';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  fetchMock = instalarFetch();
  fetchMock.mockImplementation(async () => json(200, { results: [] }));
});

afterEach(() => vi.unstubAllGlobals());

describe('descobrirFilmes', () => {
  it('pede a primeira página sem filtros por padrão', async () => {
    await descobrirFilmes();

    expect(ultimaChamada(fetchMock).url).toBe('/api/movies/discover/?page=1');
  });

  it('envia só os filtros informados, em snake_case', async () => {
    await descobrirFilmes({
      page: 3,
      sort: 'rating',
      genre: '18',
      decade: '1990',
      runtimeMax: 90,
      ratingMin: 8,
    });

    const { url } = ultimaChamada(fetchMock);
    const params = new URL(url, 'http://x').searchParams;
    expect(Object.fromEntries(params)).toEqual({
      page: '3',
      sort: 'rating',
      genre: '18',
      decade: '1990',
      runtime_max: '90',
      rating_min: '8',
    });
  });

  it('é uma rota pública: não envia o token', async () => {
    await descobrirFilmes();

    expect(
      ultimaChamada(fetchMock).opcoes.headers.Authorization,
    ).toBeUndefined();
  });
});

describe('filmesEmAlta', () => {
  it('consulta a rota pública de em alta', async () => {
    await filmesEmAlta(2);

    expect(ultimaChamada(fetchMock).url).toBe('/api/movies/trending/?page=2');
  });
});
