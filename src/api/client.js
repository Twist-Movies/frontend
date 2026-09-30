import { erroDaResposta, erroDeRede, ApiError } from './errors';
import { clearTokens, getTokens, setTokens } from './tokens';

/** Base da API. Em desenvolvimento o Vite repassa /api para o Django. */
function baseUrl() {
  return import.meta.env.VITE_API_URL || '/api';
}

const ouvintesDeExpiracao = new Set();

/**
 * Avisa quando a sessão expirou de vez (refresh recusado). O AuthProvider
 * usa isso para voltar a pessoa ao estado de visitante.
 */
export function onSessionExpired(callback) {
  ouvintesDeExpiracao.add(callback);
  return () => ouvintesDeExpiracao.delete(callback);
}

async function lerCorpo(resposta) {
  if (resposta.status === 204 || resposta.status === 205) return null;
  const tipo = resposta.headers.get('content-type') ?? '';
  if (tipo.includes('application/json')) return resposta.json();
  const texto = await resposta.text();
  return texto || null;
}

async function enviar(caminho, { method, body, token }) {
  const headers = { Accept: 'application/json' };
  let corpo = body;

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    corpo = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(`${baseUrl()}${caminho}`, {
      method,
      headers,
      body: corpo,
    });
  } catch {
    throw erroDeRede();
  }
}

// Várias chamadas podem receber 401 ao mesmo tempo; todas esperam o mesmo refresh.
let refreshEmAndamento = null;

async function renovarAccess() {
  const tokens = getTokens();
  if (!tokens) return false;

  const resposta = await enviar('/accounts/token/refresh/', {
    method: 'POST',
    body: { refresh: tokens.refresh },
  });
  if (!resposta.ok) return false;

  const dados = await lerCorpo(resposta);
  // Com ROTATE_REFRESH_TOKENS o back devolve um refresh novo; sem, mantém o atual.
  setTokens({ access: dados.access, refresh: dados.refresh ?? tokens.refresh });
  return true;
}

function renovarUmaVez() {
  refreshEmAndamento ??= renovarAccess().finally(() => {
    refreshEmAndamento = null;
  });
  return refreshEmAndamento;
}

/**
 * Chamada à API. `auth: false` para rotas públicas (login, cadastro).
 * Com auth, um 401 dispara um refresh do token e uma nova tentativa.
 */
export async function request(
  caminho,
  { method = 'GET', body, auth = true } = {},
) {
  let resposta = await enviar(caminho, {
    method,
    body,
    token: auth ? getTokens()?.access : undefined,
  });

  if (resposta.status === 401 && auth && getTokens()) {
    const renovou = await renovarUmaVez().catch(() => false);
    if (!renovou) {
      clearTokens();
      ouvintesDeExpiracao.forEach((callback) => callback());
      throw new ApiError(401, 'Sua sessão expirou. Entre novamente.');
    }
    resposta = await enviar(caminho, {
      method,
      body,
      token: getTokens().access,
    });
  }

  const dados = await lerCorpo(resposta);
  if (!resposta.ok) throw erroDaResposta(resposta.status, dados);
  return dados;
}
