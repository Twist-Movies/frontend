import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { setTokens } from './tokens';
import {
  criarResenha,
  curtirResenha,
  descurtirResenha,
  editarResenha,
  excluirResenha,
  listarResenhas,
  obterResenha,
} from './reviews';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  setTokens({ access: 'acc', refresh: 'ref' });
  fetchMock = instalarFetch();
  fetchMock.mockResolvedValue(json(200, {}));
});

afterEach(() => vi.unstubAllGlobals());

describe('api/reviews', () => {
  it('lista as resenhas de um filme por página', async () => {
    await listarResenhas(603, 2);
    expect(ultimaChamada(fetchMock).url).toBe('/api/movies/603/reviews/?page=2');
  });

  it('cria resenha enviando contains_spoiler em snake_case', async () => {
    await criarResenha(603, { content: 'Ótimo', containsSpoiler: true });

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/movies/603/reviews/');
    expect(opcoes.method).toBe('POST');
    expect(JSON.parse(opcoes.body)).toEqual({
      content: 'Ótimo',
      contains_spoiler: true,
    });
  });

  it('não marca spoiler por padrão', async () => {
    await criarResenha(603, { content: 'Ótimo' });
    expect(JSON.parse(ultimaChamada(fetchMock).opcoes.body)).toEqual({
      content: 'Ótimo',
      contains_spoiler: false,
    });
  });

  it('consulta, edita e exclui uma resenha', async () => {
    await obterResenha(9);
    expect(ultimaChamada(fetchMock).url).toBe('/api/reviews/9/');

    await editarResenha(9, { content: 'Novo', containsSpoiler: false });
    let { opcoes } = ultimaChamada(fetchMock);
    expect(opcoes.method).toBe('PATCH');
    expect(JSON.parse(opcoes.body)).toEqual({
      content: 'Novo',
      contains_spoiler: false,
    });

    await excluirResenha(9);
    ({ opcoes } = ultimaChamada(fetchMock));
    expect(opcoes.method).toBe('DELETE');
  });

  it('curte e descurte', async () => {
    await curtirResenha(9);
    let { url, opcoes } = ultimaChamada(fetchMock);
    expect([url, opcoes.method]).toEqual(['/api/reviews/9/like/', 'POST']);

    await descurtirResenha(9);
    ({ url, opcoes } = ultimaChamada(fetchMock));
    expect([url, opcoes.method]).toEqual(['/api/reviews/9/like/', 'DELETE']);
  });
});
