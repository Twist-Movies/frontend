import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { clearAccessToken, getAccessToken } from '../api/tokens';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { instalarFetch, json } from '../test/fetch';

const PERFIL = {
  id: 4,
  username: 'davi',
  email: 'davi@twist.app',
  first_name: 'Davi',
  last_name: 'Almeida',
  avatar_url: 'https://cdn/x.png',
};

let fetchMock;

beforeEach(() => {
  localStorage.clear();
  clearAccessToken();
  fetchMock = instalarFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('AuthProvider (API real)', () => {
  it('completa a sessão com /users/me/ depois do login', async () => {
    vi.stubEnv('VITE_API_MOCK', 'false');
    fetchMock.mockImplementation(async (url) =>
      url.endsWith('/accounts/login/')
        ? json(200, { access: 'a', username: 'davi' })
        : json(200, PERFIL),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() =>
      result.current.signIn({ identifier: 'davi', password: 'x' }),
    );

    expect(result.current.session).toMatchObject({
      id: 4,
      username: 'davi',
      displayName: 'Davi Almeida',
      avatarUrl: 'https://cdn/x.png',
    });
    expect(localStorage.length).toBe(0);
  });

  it('mantém a sessão básica se /users/me/ falhar', async () => {
    vi.stubEnv('VITE_API_MOCK', 'false');
    fetchMock.mockImplementation(async (url) =>
      url.endsWith('/accounts/login/')
        ? json(200, { access: 'a', username: 'davi' })
        : json(500, {}),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() =>
      result.current.signIn({ identifier: 'davi', password: 'x' }),
    );

    expect(result.current.status).toBe('autenticado');
    expect(result.current.session.username).toBe('davi');
  });

  it('updateSession mescla os campos (sem persistir)', () => {
    const wrapper = ({ children }) => (
      <AuthProvider sessaoInicial={{ username: 'davi', displayName: 'Davi' }}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.updateSession({ avatarUrl: 'https://cdn/y.png' }));

    expect(result.current.session).toEqual({
      username: 'davi',
      displayName: 'Davi',
      avatarUrl: 'https://cdn/y.png',
    });
    expect(localStorage.length).toBe(0);
  });

  describe('restauração no boot', () => {
    beforeEach(() => vi.stubEnv('VITE_API_MOCK', 'false'));

    it('restaura via refresh (cookie) + /users/me/ e mostra "carregando" antes', async () => {
      fetchMock.mockImplementation(async (url) =>
        url.endsWith('/accounts/token/refresh/')
          ? json(200, { access: 'novo' })
          : json(200, PERFIL),
      );
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      expect(result.current.status).toBe('carregando');
      await waitFor(() => expect(result.current.status).toBe('autenticado'));

      expect(result.current.session).toMatchObject({ username: 'davi', id: 4 });
      expect(getAccessToken()).toBe('novo');
      const [urlRefresh, opcoes] = fetchMock.mock.calls[0];
      expect(urlRefresh).toBe('/api/accounts/token/refresh/');
      expect(opcoes.credentials).toBe('include');
      expect(opcoes.headers['X-Twist-Client']).toBe('web');
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });

    it('vira visitante quando o refresh falha (sem cookie)', async () => {
      fetchMock.mockResolvedValue(json(401, { detail: 'sem cookie' }));
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitFor(() => expect(result.current.status).toBe('visitante'));
      expect(result.current.session).toBeNull();
      expect(getAccessToken()).toBeNull();
    });

    it('vira visitante se o refresh vale mas /users/me/ falha', async () => {
      fetchMock.mockImplementation(async (url) =>
        url.endsWith('/accounts/token/refresh/')
          ? json(200, { access: 'novo' })
          : json(500, {}),
      );
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitFor(() => expect(result.current.status).toBe('visitante'));
      expect(getAccessToken()).toBeNull();
    });

    it('vira visitante se a restauração lançar erro inesperado', async () => {
      fetchMock.mockRejectedValue(new TypeError('offline'));
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitFor(() => expect(result.current.status).toBe('visitante'));
    });

    it('não restaura quando sessaoInicial é informada', () => {
      const wrapper = ({ children }) => (
        <AuthProvider sessaoInicial={null}>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.status).toBe('visitante');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
