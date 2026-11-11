import { erroDaResposta, erroDeRede, ApiError } from './errors';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokens';

function baseUrl() {
  return import.meta.env.VITE_API_URL || '/api';
}

const ouvintesDeExpiracao = new Set();

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

// Cabeçalho exigido pelo backend em refresh/logout (defesa extra contra CSRF).
export const CABECALHO_CLIENTE = { 'X-Twist-Client': 'web' };

async function enviar(caminho, { method, body, token, headers: extras }) {
  const headers = { Accept: 'application/json', ...extras };
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
      // Envia/recebe o cookie HttpOnly do refresh (mesmo domínio ou CORS credenciado).
      credentials: 'include',
    });
  } catch {
    throw erroDeRede();
  }
}

// Várias chamadas podem receber 401 juntas; todas esperam o mesmo refresh.
let refreshEmAndamento = null;

async function renovarAccess() {
  // Sem corpo: o navegador envia o cookie HttpOnly sozinho.
  const resposta = await enviar('/accounts/token/refresh/', {
    method: 'POST',
    headers: CABECALHO_CLIENTE,
  });
  if (!resposta.ok) return false;

  const dados = await lerCorpo(resposta);
  if (!dados?.access) return false;
  setAccessToken(dados.access);
  return true;
}

export function renovarUmaVez() {
  refreshEmAndamento ??= renovarAccess().finally(() => {
    refreshEmAndamento = null;
  });
  return refreshEmAndamento;
}

export async function request(
  caminho,
  { method = 'GET', body, auth = true, headers } = {},
) {
  let resposta = await enviar(caminho, {
    method,
    body,
    headers,
    token: auth ? getAccessToken() : undefined,
  });

  if (resposta.status === 401 && auth && getAccessToken()) {
    const renovou = await renovarUmaVez().catch(() => false);
    if (!renovou) {
      clearAccessToken();
      ouvintesDeExpiracao.forEach((callback) => callback());
      throw new ApiError(401, 'Sua sessão expirou. Entre novamente.');
    }
    resposta = await enviar(caminho, {
      method,
      body,
      headers,
      token: getAccessToken(),
    });
  }

  const dados = await lerCorpo(resposta);
  if (!resposta.ok) throw erroDaResposta(resposta.status, dados);
  return dados;
}
