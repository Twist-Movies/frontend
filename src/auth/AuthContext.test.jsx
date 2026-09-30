import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { AuthError } from './session';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  beforeEach(() => localStorage.clear());

  it('começa como visitante sem sessão salva', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('visitante');
    expect(result.current.session).toBeNull();
  });

  it('recupera a sessão salva no navegador', () => {
    localStorage.setItem(
      'twist:session',
      JSON.stringify({
        username: 'bia',
        displayName: 'Bia',
        email: 'bia@twist.app',
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('autenticado');
    expect(result.current.session?.username).toBe('bia');
  });

  it('autentica e persiste ao entrar', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn({
        email: 'davi@twist.app',
        password: 'twist1234',
      });
    });

    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session?.username).toBe('davi');
    expect(localStorage.getItem('twist:session')).toContain('davi');
  });

  it('propaga a falha de credencial sem criar sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.signIn({
          email: 'davi@twist.app',
          password: 'errada',
        });
      }),
    ).rejects.toBeInstanceOf(AuthError);

    expect(result.current.status).toBe('visitante');
    expect(localStorage.getItem('twist:session')).toBeNull();
  });

  it('cadastra e já deixa a pessoa autenticada', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signUp({
        username: `conta_${sufixo}`,
        email: `conta_${sufixo}@twist.app`,
        password: 'senhaforte1',
      });
    });

    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session?.username).toBe(`conta_${sufixo}`);
  });

  it('encerra a sessão e limpa o armazenamento', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn({
        email: 'davi@twist.app',
        password: 'twist1234',
      });
    });
    act(() => result.current.signOut());

    expect(result.current.status).toBe('visitante');
    expect(localStorage.getItem('twist:session')).toBeNull();
  });
});

describe('useAuth', () => {
  it('falha claro quando usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrowError(/AuthProvider/);
  });
});
