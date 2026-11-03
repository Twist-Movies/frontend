import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, getTokens, setTokens } from './tokens';

describe('tokens', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('guarda e recupera o par de tokens', () => {
    setTokens({ access: 'a', refresh: 'r' });
    expect(getTokens()).toEqual({ access: 'a', refresh: 'r' });
  });

  it('devolve null sem tokens, com par incompleto ou corrompido', () => {
    expect(getTokens()).toBeNull();
    localStorage.setItem('twist:tokens', JSON.stringify({ access: 'a' }));
    expect(getTokens()).toBeNull();
    localStorage.setItem('twist:tokens', '{quebrado');
    expect(getTokens()).toBeNull();
  });

  it('limpa os tokens', () => {
    setTokens({ access: 'a', refresh: 'r' });
    clearTokens();
    expect(getTokens()).toBeNull();
  });

  it('não quebra com o armazenamento bloqueado', () => {
    const bloqueado = () => {
      throw new Error('bloqueado');
    };
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(bloqueado);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(bloqueado);

    expect(() => setTokens({ access: 'a', refresh: 'r' })).not.toThrow();
    expect(() => clearTokens()).not.toThrow();
  });
});
