import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { setTokens } from './tokens';
import {
  adicionarFilmeNaPlaylist,
  criarPlaylist,
  editarPlaylist,
  excluirPlaylist,
  listarPlaylists,
  obterPlaylist,
  removerFilmeDaPlaylist,
} from './playlists';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  setTokens({ access: 'acc', refresh: 'ref' });
  fetchMock = instalarFetch();
  fetchMock.mockResolvedValue(json(200, {}));
});

afterEach(() => vi.unstubAllGlobals());

describe('api/playlists', () => {
  it('lista e consulta playlists', async () => {
    await listarPlaylists(3);
    expect(ultimaChamada(fetchMock).url).toBe('/api/playlists/?page=3');

    await obterPlaylist(7);
    expect(ultimaChamada(fetchMock).url).toBe('/api/playlists/7/');
  });

  it('cria em JSON quando não há capa', async () => {
    await criarPlaylist({ name: 'Favoritos', description: '', isPublic: false });

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/playlists/');
    expect(opcoes.method).toBe('POST');
    expect(JSON.parse(opcoes.body)).toEqual({
      name: 'Favoritos',
      description: '',
      is_public: false,
    });
  });

  it('cria em multipart quando há capa', async () => {
    const capa = new File(['x'], 'capa.png', { type: 'image/png' });
    await criarPlaylist({ name: 'Favoritos', isPublic: true, cover: capa });

    const { opcoes } = ultimaChamada(fetchMock);
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.body.get('name')).toBe('Favoritos');
    expect(opcoes.body.get('is_public')).toBe('true');
    expect(opcoes.body.get('cover')).toBeInstanceOf(File);
    expect(opcoes.headers['Content-Type']).toBeUndefined();
  });

  it('edita (PATCH) e exclui', async () => {
    await editarPlaylist(7, { name: 'Novo', isPublic: true });
    let { url, opcoes } = ultimaChamada(fetchMock);
    expect([url, opcoes.method]).toEqual(['/api/playlists/7/', 'PATCH']);

    await excluirPlaylist(7);
    ({ url, opcoes } = ultimaChamada(fetchMock));
    expect([url, opcoes.method]).toEqual(['/api/playlists/7/', 'DELETE']);
  });

  it('adiciona e remove filmes pelo tmdb_id', async () => {
    await adicionarFilmeNaPlaylist(7, 603);
    let { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/playlists/7/movies/');
    expect(JSON.parse(opcoes.body)).toEqual({ tmdb_id: 603 });

    await removerFilmeDaPlaylist(7, 603);
    ({ url, opcoes } = ultimaChamada(fetchMock));
    expect([url, opcoes.method]).toEqual([
      '/api/playlists/7/movies/603/',
      'DELETE',
    ]);
  });
});
