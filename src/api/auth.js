import { request } from './client';
import { clearTokens, getTokens, setTokens } from './tokens';

export async function login({ identifier, password }) {
  const dados = await request('/accounts/login/', {
    method: 'POST',
    body: { identifier: identifier.trim(), password },
    auth: false,
  });
  setTokens({ access: dados.access, refresh: dados.refresh });

  return { username: dados.username, displayName: dados.username };
}

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

  // O cadastro não devolve tokens, então entra logo em seguida.
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
  } finally {
    clearTokens();
  }
}
