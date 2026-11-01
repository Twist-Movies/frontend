import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
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
        ? json(200, { access: 'a', refresh: 'r', username: 'davi' })
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
    expect(JSON.parse(localStorage.getItem('twist:session')).id).toBe(4);
  });

  it('mantém a sessão básica se /users/me/ falhar', async () => {
    vi.stubEnv('VITE_API_MOCK', 'false');
    fetchMock.mockImplementation(async (url) =>
      url.endsWith('/accounts/login/')
        ? json(200, { access: 'a', refresh: 'r', username: 'davi' })
        : json(500, {}),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() =>
      result.current.signIn({ identifier: 'davi', password: 'x' }),
    );

    expect(result.current.status).toBe('autenticado');
    expect(result.current.session.username).toBe('davi');
  });

  it('updateSession mescla os campos e persiste', () => {
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
    expect(JSON.parse(localStorage.getItem('twist:session')).avatarUrl).toBe(
      'https://cdn/y.png',
    );
  });
});
