import { useCallback, useEffect, useMemo, useState } from 'react';
import { onSessionExpired } from '../api/client';
import { clearTokens } from '../api/tokens';
import { authService, usandoApiReal } from './service';
import { completarSessao } from './perfil';
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
    const basica = await authService().login(credenciais);
    const nova = usandoApiReal() ? await completarSessao(basica) : basica;
    storeSession(nova);
    setSession(nova);
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const basica = await authService().register(dados);
    const nova = usandoApiReal() ? await completarSessao(basica) : basica;
    storeSession(nova);
    setSession(nova);
  }, []);

  const atualizar = useCallback((parcial) => {
    setSession((atual) => {
      if (!atual) return atual;
      const nova = { ...atual, ...parcial };
      storeSession(nova);
      return nova;
    });
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
      updateSession: atualizar,
    }),
    [session, entrar, cadastrar, sair, atualizar],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
