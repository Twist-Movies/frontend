import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout, register } from './auth';
import { getTokens, setTokens } from './tokens';

function json(status, corpo) {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('login (API real)', () => {
  it('envia identifier e senha e guarda os tokens', async () => {
    fetchMock.mockResolvedValue(
      json(200, { access: 'acc', refresh: 'ref', username: 'davi' }),
    );

    const sessao = await login({ identifier: ' davi ', password: 'x' });

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/login/');
    expect(JSON.parse(opcoes.body)).toEqual({
      identifier: 'davi',
      password: 'x',
    });
    expect(getTokens()).toEqual({ access: 'acc', refresh: 'ref' });
    expect(sessao).toEqual({ username: 'davi', displayName: 'davi' });
  });

  it('propaga credencial inválida como 401 traduzido', async () => {
    fetchMock.mockResolvedValue(json(401, { error: 'Invalid credentials' }));

    await expect(
      login({ identifier: 'x', password: 'y' }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'E-mail, usuário ou senha incorretos.',
    });
    expect(getTokens()).toBeNull();
  });
});

const CADASTRO = {
  firstName: ' Davi ',
  lastName: 'Almeida',
  username: 'davi',
  email: 'davi@twist.app',
  birthDate: '1999-05-10',
  password: 'senhaforte1',
  avatar: null,
};

describe('register (API real)', () => {
  it('envia multipart com os campos da API e entra logo depois', async () => {
    fetchMock
      .mockResolvedValueOnce(
        json(201, {
          id: 1,
          username: 'davi',
          email: 'davi@twist.app',
          first_name: 'Davi',
          last_name: 'Almeida',
          avatar_url: null,
        }),
      )
      .mockResolvedValueOnce(
        json(200, { access: 'acc', refresh: 'ref', username: 'davi' }),
      );

    const sessao = await register(CADASTRO);

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/register/');
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(Object.fromEntries(opcoes.body)).toEqual({
      username: 'davi',
      email: 'davi@twist.app',
      password: 'senhaforte1',
      first_name: 'Davi',
      last_name: 'Almeida',
      birth_date: '1999-05-10',
    });

    expect(fetchMock.mock.calls[1][0]).toBe('/api/accounts/login/');
    expect(sessao).toEqual({
      username: 'davi',
      displayName: 'Davi Almeida',
      email: 'davi@twist.app',
      avatarUrl: undefined,
    });
  });

  it('inclui a foto quando escolhida', async () => {
    fetchMock
      .mockResolvedValueOnce(
        json(201, { username: 'davi', avatar_url: 'https://x/a.png' }),
      )
      .mockResolvedValueOnce(
        json(200, { access: 'a', refresh: 'r', username: 'davi' }),
      );
    const foto = new File(['x'], 'eu.png', { type: 'image/png' });

    const sessao = await register({ ...CADASTRO, avatar: foto });

    expect(fetchMock.mock.calls[0][1].body.get('avatar')).toBeInstanceOf(File);
    expect(sessao.avatarUrl).toBe('https://x/a.png');
    expect(sessao.displayName).toBe('davi');
  });

  it('propaga os erros por campo do DRF', async () => {
    fetchMock.mockResolvedValue(
      json(400, { email: ['user with this email already exists.'] }),
    );

    await expect(register(CADASTRO)).rejects.toMatchObject({
      status: 400,
      fieldErrors: { email: 'Já existe uma conta com este e-mail.' },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe('logout (API real)', () => {
  it('revoga o refresh token e limpa os tokens', async () => {
    setTokens({ access: 'acc', refresh: 'ref' });
    fetchMock.mockResolvedValue(new Response(null, { status: 205 }));

    await logout();

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/logout/');
    expect(opcoes.headers.Authorization).toBe('Bearer acc');
    expect(JSON.parse(opcoes.body)).toEqual({ refresh: 'ref' });
    expect(getTokens()).toBeNull();
  });

  it('limpa os tokens mesmo se a API falhar', async () => {
    setTokens({ access: 'acc', refresh: 'ref' });
    fetchMock.mockRejectedValue(new TypeError('offline'));

    await expect(logout()).resolves.toBeUndefined();
    expect(getTokens()).toBeNull();
  });

  it('não chama a API quando não há tokens', async () => {
    await logout();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
