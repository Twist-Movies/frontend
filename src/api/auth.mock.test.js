import { beforeEach, describe, expect, it } from 'vitest';
import { login, logout, register } from './auth.mock';
import { getTokens } from './tokens';

beforeEach(() => localStorage.clear());

describe('login (simulado)', () => {
  it('aceita e-mail ou username, sem diferenciar maiúsculas', async () => {
    await expect(
      login({ identifier: ' DAVI@twist.app ', password: 'twist1234' }),
    ).resolves.toMatchObject({ username: 'davi', displayName: 'Davi Almeida' });

    await expect(
      login({ identifier: 'marina', password: 'twist1234' }),
    ).resolves.toMatchObject({ username: 'marina' });
    expect(getTokens()).not.toBeNull();
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
    expect(getTokens()).not.toBeNull();
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

describe('logout (simulado)', () => {
  it('limpa os tokens', async () => {
    await login({ identifier: 'davi', password: 'twist1234' });
    await logout();
    expect(getTokens()).toBeNull();
  });
});
