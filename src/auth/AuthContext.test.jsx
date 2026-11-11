import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { ApiError } from '../api/errors';
import { request } from '../api/client';
import { clearAccessToken, getAccessToken } from '../api/tokens';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const DAVI = { identifier: 'davi@twist.app', password: 'twist1234' };

describe('AuthProvider (modo simulado)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
  });

  it('mostra "carregando" enquanto tenta restaurar e vira visitante sem cookie', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('carregando');
    await waitFor(() => expect(result.current.status).toBe('visitante'));
    expect(result.current.session).toBeNull();
  });

  it('restaura a sessão pelo "cookie" simulado, sem ler perfil do storage', async () => {
    const primeiro = renderHook(() => useAuth(), { wrapper });
    await waitFor(() =>
      expect(primeiro.result.current.status).toBe('visitante'),
    );
    await act(() => primeiro.result.current.signIn(DAVI));
    primeiro.unmount();
    clearAccessToken(); // "recarregar a página": a memória some

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe('carregando');
    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session?.username).toBe('davi');
    expect(localStorage.length).toBe(0);
  });

  it('apaga o perfil legado (com e-mail) do localStorage', async () => {
    localStorage.setItem('twist:session', JSON.stringify({ username: 'bia' }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));

    expect(localStorage.getItem('twist:session')).toBeNull();
  });

  it('autentica ao entrar sem gravar nada no armazenamento', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));

    await act(() => result.current.signIn(DAVI));

    await waitFor(() => expect(result.current.status).toBe('autenticado'));
    expect(result.current.session).toMatchObject({
      username: 'davi',
      displayName: 'Davi Almeida',
    });
    expect(localStorage.length).toBe(0);
    expect(getAccessToken()).not.toBeNull();
  });

  it('propaga a falha de credencial sem criar sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));

    await expect(
      act(() => result.current.signIn({ ...DAVI, password: 'errada' })),
    ).rejects.toBeInstanceOf(ApiError);

    expect(result.current.status).toBe('visitante');
  });

  it('cadastra e já deixa a pessoa autenticada', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));

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

  it('encerra a sessão, limpa memória e o cookie simulado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));

    await act(() => result.current.signIn(DAVI));
    await act(() => result.current.signOut());

    expect(result.current.status).toBe('visitante');
    expect(getAccessToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('signOut({ remoto: false }) limpa só localmente, sem chamar logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));
    await act(() => result.current.signIn(DAVI));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await act(() => result.current.signOut({ remoto: false }));

    expect(result.current.status).toBe('visitante');
    expect(getAccessToken()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('AuthProvider com sessão expirada na API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('volta a ser visitante quando o refresh é recusado', async () => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('visitante'));
    await act(() => result.current.signIn(DAVI));

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
