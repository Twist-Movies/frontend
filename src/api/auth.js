/**
 * Autenticação na API do Django (`/api/accounts/`), conforme RF01 da spec.
 * Mesma interface de ./auth.mock.js — quem escolhe é src/auth/service.js.
 */
import { request } from './client';
import { clearTokens, getTokens, setTokens } from './tokens';

/** Login por e-mail OU nome de usuário (RF01.03). */
export async function login({ identifier, password }) {
  const dados = await request('/accounts/login/', {
    method: 'POST',
    body: { identifier: identifier.trim(), password },
    auth: false,
  });
  setTokens({ access: dados.access, refresh: dados.refresh });

  // O login só devolve o username; nome e foto chegam com /users/me/.
  return { username: dados.username, displayName: dados.username };
}

/** Cadastro (RF01.01). Vai como multipart por causa da foto opcional. */
export async function register(dados) {
  const form = new FormData();
  form.append('username', dados.username.trim());
  form.append('email', dados.email.trim());
  form.append('password', dados.password);
  form.append('first_name', dados.firstName.trim());
  form.append('last_name', dados.lastName.trim());
  form.append('birth_date', dados.birthDate);
  if (dados.avatar) form.append('avatar', dados.avatar);

  const usuario = await request('/accounts/register/', {
    method: 'POST',
    body: form,
    auth: false,
  });

  // O cadastro não devolve tokens: entra em seguida com a senha recém-criada.
  await login({ identifier: dados.email, password: dados.password });

  return {
    username: usuario.username,
    displayName:
      `${usuario.first_name ?? ''} ${usuario.last_name ?? ''}`.trim() ||
      usuario.username,
    email: usuario.email,
    avatarUrl: usuario.avatar_url ?? undefined,
  };
}

/**
 * Logout (RF01.05): revoga o refresh token no back. Mesmo que a chamada
 * falhe, a sessão local é encerrada — sair nunca pode travar a pessoa.
 */
export async function logout() {
  const tokens = getTokens();
  try {
    if (tokens) {
      await request('/accounts/logout/', {
        method: 'POST',
        body: { refresh: tokens.refresh },
      });
    }
  } catch {
    // Token já revogado ou back fora do ar: o access expira sozinho.
  } finally {
    clearTokens();
  }
}
