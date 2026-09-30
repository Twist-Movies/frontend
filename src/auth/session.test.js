import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthError,
  clearStoredSession,
  isUsernameAvailable,
  loadStoredSession,
  signIn,
  signUp,
  storeSession,
} from './session';

const SESSAO = {
  username: 'davi',
  displayName: 'Davi Almeida',
  email: 'davi@twist.app',
};

describe('signIn', () => {
  it('devolve a sessão com as credenciais corretas', async () => {
    await expect(
      signIn({ email: 'davi@twist.app', password: 'twist1234' }),
    ).resolves.toEqual(SESSAO);
  });

  it('ignora maiúsculas e espaços no e-mail', async () => {
    await expect(
      signIn({ email: '  DAVI@Twist.App  ', password: 'twist1234' }),
    ).resolves.toEqual(SESSAO);
  });

  it('recusa senha errada como erro de cliente 401', async () => {
    const erro = await signIn({
      email: 'davi@twist.app',
      password: 'errada',
    }).catch((e) => e);

    expect(erro).toBeInstanceOf(AuthError);
    expect(erro.kind).toBe('credenciais');
    expect(erro.status).toBe(401);
    // Indicador 3: 4xx não conta como falha da aplicação.
    expect(erro.isClientError).toBe(true);
  });

  it('recusa e-mail inexistente', async () => {
    await expect(
      signIn({ email: 'ninguem@twist.app', password: 'x' }),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

describe('signUp', () => {
  it('cria a conta e já devolve a sessão', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);
    const sessao = await signUp({
      username: `novo_${sufixo}`,
      email: `novo_${sufixo}@twist.app`,
      password: 'senhaforte1',
    });

    expect(sessao.username).toBe(`novo_${sufixo}`);
    expect(sessao.email).toBe(`novo_${sufixo}@twist.app`);
  });

  it('recusa nome de usuário já existente com 409', async () => {
    const erro = await signUp({
      username: 'davi',
      email: 'outro@twist.app',
      password: 'senhaforte1',
    }).catch((e) => e);

    expect(erro.kind).toBe('usuario-em-uso');
    expect(erro.status).toBe(409);
    expect(erro.isClientError).toBe(true);
  });

  it('recusa e-mail já cadastrado', async () => {
    const erro = await signUp({
      username: `livre_${Math.random().toString(36).slice(2, 8)}`,
      email: 'davi@twist.app',
      password: 'senhaforte1',
    }).catch((e) => e);

    expect(erro.kind).toBe('email-em-uso');
    expect(erro.status).toBe(409);
  });
});

describe('isUsernameAvailable', () => {
  it('reconhece nome ocupado', async () => {
    await expect(isUsernameAvailable('davi')).resolves.toBe(false);
    await expect(isUsernameAvailable('  DAVI ')).resolves.toBe(false);
  });

  it('reconhece nome livre', async () => {
    await expect(isUsernameAvailable('ninguem_usa_isso')).resolves.toBe(true);
  });
});

describe('AuthError', () => {
  it('classifica 5xx como falha de servidor', () => {
    const erro = new AuthError('servidor', 500, 'caiu');

    expect(erro.isClientError).toBe(false);
    expect(erro.name).toBe('AuthError');
  });
});

describe('persistência da sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('guarda e recupera a sessão', () => {
    storeSession(SESSAO);

    expect(loadStoredSession()).toEqual(SESSAO);
  });

  it('devolve null quando não há nada guardado', () => {
    expect(loadStoredSession()).toBeNull();
  });

  it('descarta conteúdo corrompido', () => {
    localStorage.setItem('twist:session', '{isso não é json');

    expect(loadStoredSession()).toBeNull();
  });

  it('descarta sessão sem os campos obrigatórios', () => {
    localStorage.setItem(
      'twist:session',
      JSON.stringify({ displayName: 'Só o nome' }),
    );

    expect(loadStoredSession()).toBeNull();
  });

  it('usa o username como nome de exibição quando ele falta', () => {
    localStorage.setItem(
      'twist:session',
      JSON.stringify({ username: 'bia', email: 'bia@twist.app' }),
    );

    expect(loadStoredSession()?.displayName).toBe('bia');
  });

  it('limpa a sessão', () => {
    storeSession(SESSAO);
    clearStoredSession();

    expect(loadStoredSession()).toBeNull();
  });

  it('não quebra quando o armazenamento está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(() => storeSession(SESSAO)).not.toThrow();
    expect(loadStoredSession()).toBeNull();
    expect(() => clearStoredSession()).not.toThrow();
  });
});
