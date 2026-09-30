import { useCallback, useMemo, useState } from 'react';
import {
  clearStoredSession,
  loadStoredSession,
  signIn as apiSignIn,
  signUp as apiSignUp,
  storeSession,
} from './session';

import { AuthContext } from './context';

export function AuthProvider({ children, sessaoInicial }) {
  const [session, setSession] = useState(
    () => sessaoInicial ?? loadStoredSession(),
  );

  const entrar = useCallback(async (credenciais) => {
    const nova = await apiSignIn(credenciais);
    storeSession(nova);
    setSession(nova);
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const nova = await apiSignUp(dados);
    storeSession(nova);
    setSession(nova);
  }, []);

  const sair = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

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
