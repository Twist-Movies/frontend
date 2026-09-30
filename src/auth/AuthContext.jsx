import { useCallback, useEffect, useMemo, useState } from 'react';
import { onSessionExpired } from '../api/client';
import { clearTokens } from '../api/tokens';
import { authService } from './service';
import { clearStoredSession, loadStoredSession, storeSession } from './session';
import { AuthContext } from './context';

export function AuthProvider({ children, sessaoInicial }) {
  const [session, setSession] = useState(
    () => sessaoInicial ?? loadStoredSession(),
  );

  const encerrar = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  useEffect(() => onSessionExpired(encerrar), [encerrar]);

  const entrar = useCallback(async (credenciais) => {
    const nova = await authService().login(credenciais);
    storeSession(nova);
    setSession(nova);
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const nova = await authService().register(dados);
    storeSession(nova);
    setSession(nova);
  }, []);

  const sair = useCallback(async () => {
    try {
      await authService().logout();
    } finally {
      clearTokens();
      encerrar();
    }
  }, [encerrar]);

  const valor = useMemo(
    () => ({
      session,
      status: session ? 'autenticado' : 'visitante',
      signIn: entrar,
      signUp: cadastrar,
      signOut: sair,
    }),
    [session, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
