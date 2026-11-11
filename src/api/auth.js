import { CABECALHO_CLIENTE, renovarUmaVez, request } from './client';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokens';

export async function login({ identifier, password }) {
  const dados = await request('/accounts/login/', {
    method: 'POST',
    body: { identifier: identifier.trim(), password },
    auth: false,
  });
  // O refresh chega num cookie HttpOnly (Set-Cookie); o corpo só traz o access.
  setAccessToken(dados.access);

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

// Restaura a sessão no carregamento: o cookie HttpOnly vira um access novo.
// Devolve a sessão básica (ou null); o perfil completo vem de /users/me/.
export async function restore() {
  if (!getAccessToken()) {
    const renovou = await renovarUmaVez().catch(() => false);
    if (!renovou) return null;
  }
  return {};
}

export async function logout() {
  try {
    // Sem corpo: o backend lê o cookie e o apaga na resposta (205).
    // Não depende do Bearer: funciona com o access expirado ou ausente.
    await request('/accounts/logout/', {
      method: 'POST',
      auth: false,
      headers: CABECALHO_CLIENTE,
    });
  } catch {
  } finally {
    clearAccessToken();
  }
}

export async function solicitarRecuperacaoSenha(email) {
  await request('/accounts/password-reset/', {
    method: 'POST',
    body: { email: email.trim() },
    auth: false,
  });
}

export async function redefinirSenha({ uid, token, password }) {
  await request('/accounts/password-reset/confirm/', {
    method: 'POST',
    body: { uid, token, new_password: password },
    auth: false,
  });
}
