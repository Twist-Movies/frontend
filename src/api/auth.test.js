import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  login,
  logout,
  restore,
  redefinirSenha,
  register,
  solicitarRecuperacaoSenha,
} from './auth';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokens';

function json(status, corpo) {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  clearAccessToken();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('login (API real)', () => {
  it('envia identifier e senha e guarda o access só em memória', async () => {
    fetchMock.mockResolvedValue(json(200, { access: 'acc', username: 'davi' }));

    const sessao = await login({ identifier: ' davi ', password: 'x' });

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/login/');
    expect(JSON.parse(opcoes.body)).toEqual({
      identifier: 'davi',
      password: 'x',
    });
    expect(opcoes.credentials).toBe('include');
    expect(getAccessToken()).toBe('acc');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
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
    expect(getAccessToken()).toBeNull();
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
      .mockResolvedValueOnce(json(200, { access: 'acc', username: 'davi' }));

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
      .mockResolvedValueOnce(json(200, { access: 'a', username: 'davi' }));
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

describe('restore (API real)', () => {
  it('troca o cookie de refresh por um access novo', async () => {
    fetchMock.mockResolvedValue(json(200, { access: 'novo' }));

    await expect(restore()).resolves.toEqual({});

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/token/refresh/');
    expect(opcoes.credentials).toBe('include');
    expect(opcoes.headers['X-Twist-Client']).toBe('web');
    expect(opcoes.body).toBeUndefined();
    expect(getAccessToken()).toBe('novo');
    expect(localStorage.length).toBe(0);
  });

  it('devolve null quando não há cookie válido (401)', async () => {
    fetchMock.mockResolvedValue(json(401, { detail: 'sem cookie' }));
    await expect(restore()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('devolve null em falha de rede', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    await expect(restore()).resolves.toBeNull();
  });

  it('não chama a API quando já há access em memória', async () => {
    setAccessToken('acc');
    await expect(restore()).resolves.toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('logout (API real)', () => {
  it('chama a API sem corpo, com credentials e X-Twist-Client, e limpa a memória', async () => {
    setAccessToken('acc');
    fetchMock.mockResolvedValue(new Response(null, { status: 205 }));

    await logout();

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/logout/');
    expect(opcoes.method).toBe('POST');
    expect(opcoes.body).toBeUndefined();
    expect(opcoes.credentials).toBe('include');
    expect(opcoes.headers['X-Twist-Client']).toBe('web');
    expect(opcoes.headers.Authorization).toBeUndefined();
    expect(getAccessToken()).toBeNull();
  });

  it('funciona sem access em memória (expirado/ausente)', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 205 }));

    await logout();

    const [, opcoes] = fetchMock.mock.calls[0];
    expect(opcoes.headers.Authorization).toBeUndefined();
    expect(opcoes.credentials).toBe('include');
    expect(opcoes.headers['X-Twist-Client']).toBe('web');
  });

  it('limpa a memória mesmo se a API falhar', async () => {
    setAccessToken('acc');
    fetchMock.mockRejectedValue(new TypeError('offline'));

    await expect(logout()).resolves.toBeUndefined();
    expect(getAccessToken()).toBeNull();
  });
});

describe('recuperação de senha (API real)', () => {
  it('solicita o link sem autenticação', async () => {
    setAccessToken('acc');
    fetchMock.mockResolvedValue(json(200, { detail: 'ok' }));

    await solicitarRecuperacaoSenha(' a@b.co ');

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/password-reset/');
    expect(opcoes.headers.Authorization).toBeUndefined();
    expect(JSON.parse(opcoes.body)).toEqual({ email: 'a@b.co' });
  });

  it('redefine enviando uid, token e new_password', async () => {
    fetchMock.mockResolvedValue(json(200, { detail: 'ok' }));

    await redefinirSenha({ uid: 'u', token: 't', password: 'senhaforte1' });

    const [url, opcoes] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/accounts/password-reset/confirm/');
    expect(JSON.parse(opcoes.body)).toEqual({
      uid: 'u',
      token: 't',
      new_password: 'senhaforte1',
    });
  });

  it('propaga o erro de link inválido', async () => {
    fetchMock.mockResolvedValue(
      json(400, { detail: 'Link inválido ou expirado.' }),
    );
    await expect(
      redefinirSenha({ uid: 'u', token: 't', password: 'x' }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Link inválido ou expirado.',
    });
  });
});
