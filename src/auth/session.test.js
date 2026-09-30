import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStoredSession, loadStoredSession, storeSession } from './session';
import { setTokens } from '../api/tokens';

const SESSAO = {
  username: 'davi',
  displayName: 'Davi Almeida',
  email: 'davi@twist.app',
  avatarUrl: undefined,
};

describe('persistência da sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    setTokens({ access: 'a', refresh: 'r' });
  });

  it('guarda e recupera a sessão', () => {
    storeSession(SESSAO);

    expect(loadStoredSession()).toEqual(SESSAO);
  });

  it('não recupera o perfil sem tokens', () => {
    storeSession(SESSAO);
    localStorage.removeItem('twist:tokens');

    expect(loadStoredSession()).toBeNull();
  });

  it('devolve null quando não há nada guardado', () => {
    expect(loadStoredSession()).toBeNull();
  });

  it('descarta conteúdo corrompido', () => {
    localStorage.setItem('twist:session', '{isso não é json');

    expect(loadStoredSession()).toBeNull();
  });

  it('descarta sessão sem username', () => {
    localStorage.setItem(
      'twist:session',
      JSON.stringify({ displayName: 'Só o nome' }),
    );

    expect(loadStoredSession()).toBeNull();
  });

  it('usa o username como nome de exibição quando ele falta', () => {
    localStorage.setItem('twist:session', JSON.stringify({ username: 'bia' }));

    expect(loadStoredSession()?.displayName).toBe('bia');
  });

  it('limpa a sessão', () => {
    storeSession(SESSAO);
    clearStoredSession();

    expect(loadStoredSession()).toBeNull();
  });

  it('não quebra quando o armazenamento está bloqueado', () => {
    const bloqueado = () => {
      throw new Error('bloqueado');
    };
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(bloqueado);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(bloqueado);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(bloqueado);

    expect(() => storeSession(SESSAO)).not.toThrow();
    expect(loadStoredSession()).toBeNull();
    expect(() => clearStoredSession()).not.toThrow();
  });
});
