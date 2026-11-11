import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CHAVE_LEGADA,
  clearAccessToken,
  getAccessToken,
  limparTokensLegados,
  setAccessToken,
} from './tokens';

describe('tokens (em memória)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it('guarda e recupera o access token', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('a');
    expect(getAccessToken()).toBe('a');
  });

  it('nunca grava o token em localStorage nem sessionStorage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setAccessToken('eyJhbGciOi.eyJzdWIi.assinatura');

    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('limpa o access token', () => {
    setAccessToken('a');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('apaga a chave legada com o par de tokens antigo', () => {
    localStorage.setItem(
      CHAVE_LEGADA,
      JSON.stringify({ access: 'a', refresh: 'r' }),
    );
    limparTokensLegados();
    expect(localStorage.getItem('twist:tokens')).toBeNull();
  });

  it('apaga a chave legada ao carregar o módulo', async () => {
    localStorage.setItem('twist:tokens', '{"access":"a","refresh":"r"}');
    vi.resetModules();
    await import('./tokens');
    expect(localStorage.getItem('twist:tokens')).toBeNull();
  });

  it('não quebra com o armazenamento bloqueado', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => limparTokensLegados()).not.toThrow();
  });
});
