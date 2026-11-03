import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json, ultimaChamada } from '../test/fetch';
import { setTokens } from './tokens';
import {
  deixarDeSeguir,
  editarMeuPerfil,
  excluirMinhaConta,
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
  seguirUsuario,
} from './users';

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  setTokens({ access: 'acc', refresh: 'ref' });
  fetchMock = instalarFetch();
  fetchMock.mockResolvedValue(json(200, {}));
});

afterEach(() => vi.unstubAllGlobals());

describe('api/users', () => {
  it('consulta o próprio perfil com o token', async () => {
    await obterMeuPerfil();

    const { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/users/me/');
    expect(opcoes.headers.Authorization).toBe('Bearer acc');
  });

  it('edita o perfil em JSON, mapeando para snake_case', async () => {
    await editarMeuPerfil({
      username: 'davi',
      email: 'd@x.com',
      firstName: 'Davi',
      lastName: 'A',
      birthDate: '',
      bio: 'oi',
    });

    const { opcoes } = ultimaChamada(fetchMock);
    expect(opcoes.method).toBe('PATCH');
    expect(JSON.parse(opcoes.body)).toEqual({
      username: 'davi',
      email: 'd@x.com',
      first_name: 'Davi',
      last_name: 'A',
      birth_date: null,
      bio: 'oi',
    });
  });

  it('edita o perfil em multipart quando há avatar', async () => {
    const avatar = new File(['x'], 'a.png', { type: 'image/png' });
    await editarMeuPerfil({ username: 'davi', birthDate: '2000-01-02', avatar });

    const { opcoes } = ultimaChamada(fetchMock);
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.body.get('birth_date')).toBe('2000-01-02');
    expect(opcoes.body.get('avatar')).toBeInstanceOf(File);
  });

  it('exclui a conta confirmando o username', async () => {
    await excluirMinhaConta('davi');

    const { opcoes } = ultimaChamada(fetchMock);
    expect(opcoes.method).toBe('DELETE');
    expect(JSON.parse(opcoes.body)).toEqual({ username: 'davi' });
  });

  it('segue e deixa de seguir', async () => {
    await seguirUsuario(5);
    let { url, opcoes } = ultimaChamada(fetchMock);
    expect([url, opcoes.method]).toEqual(['/api/users/5/follow/', 'POST']);

    await deixarDeSeguir(5);
    ({ url, opcoes } = ultimaChamada(fetchMock));
    expect([url, opcoes.method]).toEqual(['/api/users/5/follow/', 'DELETE']);
  });

  it('lista seguidores e seguindo sem token (rotas públicas)', async () => {
    await listarSeguidores(5, 2);
    let { url, opcoes } = ultimaChamada(fetchMock);
    expect(url).toBe('/api/users/5/followers/?page=2');
    expect(opcoes.headers.Authorization).toBeUndefined();

    await listarSeguindo(5);
    ({ url } = ultimaChamada(fetchMock));
    expect(url).toBe('/api/users/5/following/?page=1');
  });
});
