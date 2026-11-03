import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { instalarFetch, json } from '../test/fetch';
import { setTokens } from '../api/tokens';
import { completarSessao, sessaoDoPerfil } from './perfil';

const PERFIL = {
  id: 4,
  username: 'davi',
  email: 'davi@twist.app',
  first_name: 'Davi',
  last_name: 'Almeida',
  avatar_url: 'https://cdn/x.png',
};

describe('sessaoDoPerfil', () => {
  it('converte o perfil da API em sessão', () => {
    expect(sessaoDoPerfil(PERFIL)).toEqual({
      id: 4,
      username: 'davi',
      email: 'davi@twist.app',
      displayName: 'Davi Almeida',
      avatarUrl: 'https://cdn/x.png',
    });
  });

  it('usa o username quando não há nome, e omite avatar nulo', () => {
    const sessao = sessaoDoPerfil({ ...PERFIL, first_name: '', last_name: '', avatar_url: null });
    expect(sessao.displayName).toBe('davi');
    expect(sessao.avatarUrl).toBeUndefined();
  });
});

describe('completarSessao', () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    setTokens({ access: 'a', refresh: 'r' });
    fetchMock = instalarFetch();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('completa a sessão básica com os dados de /users/me/', async () => {
    fetchMock.mockResolvedValue(json(200, PERFIL));

    await expect(completarSessao({ username: 'davi' })).resolves.toMatchObject({
      id: 4,
      displayName: 'Davi Almeida',
    });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/users/me/');
  });

  it('mantém a sessão básica se a consulta falhar', async () => {
    fetchMock.mockResolvedValue(json(500, {}));
    const basica = { username: 'davi', displayName: 'davi' };

    await expect(completarSessao(basica)).resolves.toBe(basica);
  });
});
