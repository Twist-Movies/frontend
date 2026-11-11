import { useCallback, useEffect, useMemo, useState } from 'react';
import { onSessionExpired } from '../api/client';
import { clearAccessToken } from '../api/tokens';
import { authService, usandoApiReal } from './service';
import { completarSessao } from './perfil';
import { limparSessaoLegada } from './session';
import { AuthContext } from './context';

// `sessaoInicial` (testes/SSR): undefined = restaurar pelo cookie de refresh;
// null = visitante; objeto = já autenticado.
export function AuthProvider({ children, sessaoInicial }) {
  const [session, setSession] = useState(sessaoInicial ?? null);
  // Aviso exibido no login após um encerramento forçado (ex.: e-mail trocado).
  const [aviso, setAviso] = useState(null);
  const [restaurando, setRestaurando] = useState(sessaoInicial === undefined);

  const encerrar = useCallback(() => {
    clearAccessToken();
    setSession(null);
  }, []);

  useEffect(() => onSessionExpired(encerrar), [encerrar]);

  useEffect(() => {
    limparSessaoLegada();
    if (sessaoInicial !== undefined) return undefined;

    let ativo = true;
    (async () => {
      let restaurada = null;
      try {
        const basica = await authService().restore();
        if (basica) {
          restaurada = usandoApiReal() ? await completarSessao(basica) : basica;
          // Sem username não há sessão utilizável (ex.: /users/me/ falhou).
          if (!restaurada?.username) restaurada = null;
        }
      } catch {
        restaurada = null;
      }
      if (!ativo) return;
      if (!restaurada) clearAccessToken();
      setSession(restaurada);
      setRestaurando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [sessaoInicial]);

  const entrar = useCallback(async (credenciais) => {
    const basica = await authService().login(credenciais);
    const nova = usandoApiReal() ? await completarSessao(basica) : basica;
    setAviso(null);
    setSession(nova);
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const basica = await authService().register(dados);
    const nova = usandoApiReal() ? await completarSessao(basica) : basica;
    setAviso(null);
    setSession(nova);
  }, []);

  const atualizar = useCallback((parcial) => {
    setSession((atual) => (atual ? { ...atual, ...parcial } : atual));
  }, []);

  // `remoto: false` encerra só localmente (ex.: conta excluída: não há o que
  // revogar nem refresh a tentar).
  const sair = useCallback(
    async ({ remoto = true, aviso: mensagem = null } = {}) => {
      setAviso(mensagem);
      try {
        if (remoto) await authService().logout();
      } finally {
        encerrar();
      }
    },
    [encerrar],
  );

  const valor = useMemo(
    () => ({
      session,
      status: restaurando
        ? 'carregando'
        : session
          ? 'autenticado'
          : 'visitante',
      signIn: entrar,
      signUp: cadastrar,
      signOut: sair,
      aviso,
      updateSession: atualizar,
    }),
    [session, restaurando, aviso, entrar, cadastrar, sair, atualizar],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
