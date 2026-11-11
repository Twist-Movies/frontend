import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  login,
  logout,
  restore,
  redefinirSenha,
  register,
  solicitarRecuperacaoSenha,
} from './auth.mock';
import { clearAccessToken, getAccessToken } from './tokens';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  clearAccessToken();
});

describe('login (simulado)', () => {
  it('aceita e-mail ou username, sem diferenciar maiúsculas', async () => {
    await expect(
      login({ identifier: ' DAVI@twist.app ', password: 'twist1234' }),
    ).resolves.toMatchObject({ username: 'davi', displayName: 'Davi Almeida' });

    await expect(
      login({ identifier: 'marina', password: 'twist1234' }),
    ).resolves.toMatchObject({ username: 'marina' });
    expect(getAccessToken()).not.toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('recusa senha errada com 401, como o Django', async () => {
    await expect(
      login({ identifier: 'davi', password: 'errada' }),
    ).rejects.toMatchObject({ status: 401, isClientError: true });
  });
});

describe('register (simulado)', () => {
  const novo = (sufixo) => ({
    firstName: 'Bia',
    lastName: 'Souza',
    username: `bia_${sufixo}`,
    email: `bia_${sufixo}@twist.app`,
    birthDate: '2001-02-03',
    password: 'senhaforte1',
  });

  it('cria a conta e já entra', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);

    await expect(register(novo(sufixo))).resolves.toMatchObject({
      username: `bia_${sufixo}`,
      displayName: 'Bia Souza',
    });
    expect(getAccessToken()).not.toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('recusa username e e-mail em uso com erros por campo (400)', async () => {
    await expect(
      register({ ...novo('x'), username: 'Davi', email: 'davi@twist.app' }),
    ).rejects.toMatchObject({
      status: 400,
      fieldErrors: {
        username: 'Este nome de usuário já existe.',
        email: 'Já existe uma conta com este e-mail.',
      },
    });
  });
});

describe('logout e restore (simulado)', () => {
  it('limpa o access e a simulação do cookie', async () => {
    await login({ identifier: 'davi', password: 'twist1234' });
    await logout();
    expect(getAccessToken()).toBeNull();
    await expect(restore()).resolves.toBeNull();
  });

  it('restaura a sessão após "recarregar" (access some, flag fica)', async () => {
    await login({ identifier: 'davi', password: 'twist1234' });
    clearAccessToken();

    await expect(restore()).resolves.toMatchObject({ username: 'davi' });
    expect(getAccessToken()).toBe('mock-access-davi');
  });

  it('sem login prévio não há o que restaurar', async () => {
    await expect(restore()).resolves.toBeNull();
  });

  it('não quebra com sessionStorage bloqueado', async () => {
    const bloqueado = () => {
      throw new Error('bloqueado');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(bloqueado);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(bloqueado);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(bloqueado);
    await expect(restore()).resolves.toBeNull();
    await expect(
      login({ identifier: 'davi', password: 'twist1234' }),
    ).resolves.toBeDefined();
    await expect(logout()).resolves.toBeUndefined();
    vi.restoreAllMocks();
  });
});

describe('recuperação de senha (simulada)', () => {
  it('a solicitação é sempre bem-sucedida', async () => {
    await expect(
      solicitarRecuperacaoSenha('qualquer@x.com'),
    ).resolves.toBeUndefined();
  });

  it('redefine a senha com o token válido', async () => {
    await redefinirSenha({
      uid: 'marina',
      token: 'valido',
      password: 'nova12345',
    });

    await expect(
      login({ identifier: 'marina', password: 'nova12345' }),
    ).resolves.toMatchObject({ username: 'marina' });
    await expect(
      login({ identifier: 'marina', password: 'twist1234' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rejeita outros tokens com 400', async () => {
    await expect(
      redefinirSenha({ uid: 'davi', token: 'velho', password: 'nova12345' }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Link inválido ou expirado.',
    });
  });
});
