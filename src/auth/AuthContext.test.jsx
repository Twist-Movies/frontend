import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { ApiError } from '../api/errors';
import { request } from '../api/client';
import { getTokens, setTokens } from '../api/tokens';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const DAVI = { identifier: 'davi@twist.app', password: 'twist1234' };

describe('AuthProvider (modo simulado)', () => {
  beforeEach(() => localStorage.clear());

  it('começa como visitante sem sessão salva', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('visitante');
    expect(result.current.session).toBeNull();
  });

  it('recupera a sessão salva quando há tokens', () => {
    setTokens({ access: 'a', refresh: 'r' });
    localStorage.setItem(
      'twist:session',
      JSON.stringify({ username: 'bia', displayName: 'Bia' }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('autenticado');
    expect(result.current.session?.username).toBe('bia');
  });

  it('ignora o perfil salvo se os tokens sumiram', () => {
    localStorage.setItem('twist:session', JSON.stringify({ username: 'bia' }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('visitante');
  });

  it('autentica, guarda o perfil e os tokens ao entrar', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.signIn(DAVI));

    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session).toMatchObject({
      username: 'davi',
      displayName: 'Davi Almeida',
    });
    expect(localStorage.getItem('twist:session')).toContain('davi');
    expect(getTokens()).not.toBeNull();
  });

  it('propaga a falha de credencial sem criar sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.signIn({ ...DAVI, password: 'errada' })),
    ).rejects.toBeInstanceOf(ApiError);

    expect(result.current.status).toBe('visitante');
    expect(localStorage.getItem('twist:session')).toBeNull();
  });

  it('cadastra e já deixa a pessoa autenticada', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() =>
      result.current.signUp({
        firstName: 'Conta',
        lastName: 'Nova',
        username: `conta_${sufixo}`,
        email: `conta_${sufixo}@twist.app`,
        birthDate: '2000-01-01',
        password: 'senhaforte1',
      }),
    );

    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session).toMatchObject({
      username: `conta_${sufixo}`,
      displayName: 'Conta Nova',
    });
  });

  it('encerra a sessão, limpa perfil e tokens', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.signIn(DAVI));
    await act(() => result.current.signOut());

    expect(result.current.status).toBe('visitante');
    expect(localStorage.getItem('twist:session')).toBeNull();
    expect(getTokens()).toBeNull();
  });
});

describe('AuthProvider com sessão expirada na API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('volta a ser visitante quando o refresh é recusado', async () => {
    localStorage.clear();
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.signIn(DAVI));

    // Qualquer chamada autenticada que receba 401 e não consiga renovar.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    );
    await act(async () => {
      await request('/users/me/').catch(() => {});
    });

    expect(result.current.status).toBe('visitante');
  });
});

describe('useAuth', () => {
  it('falha claro quando usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrowError(/AuthProvider/);
  });
});
