import { obterMeuPerfil } from '../api/users';
import { nomeCompleto } from '../lib/formatar';

export function sessaoDoPerfil(perfil, base = {}) {
  return {
    ...base,
    id: perfil.id,
    username: perfil.username,
    email: perfil.email,
    displayName: nomeCompleto(perfil) || perfil.username,
    avatarUrl: perfil.avatar_url ?? undefined,
  };
}

// O login só devolve o username; o resto vem de /users/me/.
// Se essa consulta falhar, a sessão básica continua valendo.
export async function completarSessao(sessao) {
  try {
    return sessaoDoPerfil(await obterMeuPerfil(), sessao);
  } catch {
    return sessao;
  }
}
