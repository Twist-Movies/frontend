import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { setTokens } from './tokens';
import {
  adicionarAWatchlist,
  avaliarFilme,
  buscarFilmes,
  desmarcarAssistido,
  detalheDoFilme,
  marcarAssistido,
  reagirAoFilme,
  removerAvaliacao,
  removerDaWatchlist,
  removerReacao,
} from './movies';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  setTokens({ access: 'acc', refresh: 'ref' });
  fetchMock = instalarFetch();
  fetchMock.mockResolvedValue(json(200, { ok: true }));
});

afterEach(() => vi.unstubAllGlobals());

describe('api/movies', () => {
  it('busca filmes sem enviar o token (rota pública)', async () => {
    await buscarFilmes({ q: 'matrix', page: 2 });

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/movies/search/?q=matrix&page=2');
    expect(opcoes.headers.Authorization).toBeUndefined();
  });

  it('usa a página 1 por padrão e codifica o termo', async () => {
    await buscarFilmes({ q: 'a&b' });

    expect(ultimaChamada(fetchMock).url).toBe(
      '/api/movies/search/?q=a%26b&page=1',
    );
  });

  it('busca o detalhe com o token (traz o estado do usuário)', async () => {
    await detalheDoFilme(603);

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/movies/603/');
    expect(opcoes.headers.Authorization).toBe('Bearer acc');
  });

  it.each([
    ['marcarAssistido', marcarAssistido, [603], 'POST', '/watch/', undefined],
    ['desmarcarAssistido', desmarcarAssistido, [603], 'DELETE', '/watch/'],
    ['adicionarAWatchlist', adicionarAWatchlist, [603], 'POST', '/watchlist/'],
    ['removerDaWatchlist', removerDaWatchlist, [603], 'DELETE', '/watchlist/'],
    ['avaliarFilme', avaliarFilme, [603, 4], 'PUT', '/rating/', { stars: 4 }],
    ['removerAvaliacao', removerAvaliacao, [603], 'DELETE', '/rating/'],
    [
      'reagirAoFilme',
      reagirAoFilme,
      [603, 'LIKE'],
      'PUT',
      '/reaction/',
      { reaction: 'LIKE' },
    ],
    ['removerReacao', removerReacao, [603], 'DELETE', '/reaction/'],
  ])('%s chama o endpoint certo', async (_nome, fn, args, metodo, fim, corpo) => {
    await fn(...args);

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe(`/api/movies/603${fim}`);
    expect(opcoes.method).toBe(metodo);
    if (corpo) expect(JSON.parse(opcoes.body)).toEqual(corpo);
    else expect(opcoes.body).toBeUndefined();
  });
});
