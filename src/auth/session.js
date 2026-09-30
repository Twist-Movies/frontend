/**
 * Camada de sessão do TWIST.
 *
 * Não existe back-end: este módulo simula a API de autenticação, incluindo
 * latência e falhas. Quando a API real existir, só este arquivo muda — as
 * telas e o contexto continuam iguais.
 */

/**
 * A ficha do indicador 3 conta apenas erros 5xx como falha da aplicação.
 * Por isso cada falha carrega o status: 4xx é resposta esperada e se resolve
 * na própria tela; 5xx é falha de sistema e merece tratamento à parte.
 */

export class AuthError extends Error {
  kind;
  status;

  constructor(kind, status, message) {
    super(message);
    this.name = 'AuthError';
    this.kind = kind;
    this.status = status;
  }

  /** Erro do cliente: o usuário consegue corrigir sozinho, sem alarde. */
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

const CONTAS = [
  {
    username: 'davi',
    displayName: 'Davi Almeida',
    email: 'davi@twist.app',
    password: 'twist1234',
  },
  {
    username: 'marina',
    displayName: 'Marina Costa',
    email: 'marina@twist.app',
    password: 'twist1234',
  },
];

const LATENCIA_MS = 400;

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paraSessao(conta) {
  return {
    username: conta.username,
    displayName: conta.displayName,
    email: conta.email,
  };
}

export async function signIn(credenciais) {
  await esperar(LATENCIA_MS);

  const conta = CONTAS.find(
    (c) =>
      c.email.toLowerCase() === credenciais.email.trim().toLowerCase() &&
      c.password === credenciais.password,
  );

  if (!conta) {
    throw new AuthError('credenciais', 401, 'E-mail ou senha incorretos.');
  }

  return paraSessao(conta);
}

export async function signUp(dados) {
  await esperar(LATENCIA_MS);

  const username = dados.username.trim().toLowerCase();
  const email = dados.email.trim().toLowerCase();

  if (CONTAS.some((c) => c.username === username)) {
    throw new AuthError(
      'usuario-em-uso',
      409,
      'Este nome de usuário já existe.',
    );
  }

  if (CONTAS.some((c) => c.email.toLowerCase() === email)) {
    throw new AuthError(
      'email-em-uso',
      409,
      'Já existe uma conta com este e-mail.',
    );
  }

  const conta = {
    username,
    displayName: dados.username.trim(),
    email,
    password: dados.password,
  };
  CONTAS.push(conta);

  return paraSessao(conta);
}

/** Consulta de disponibilidade enquanto o usuário digita, como no cadastro real. */
export async function isUsernameAvailable(username) {
  await esperar(200);
  return !CONTAS.some((c) => c.username === username.trim().toLowerCase());
}

const CHAVE = 'twist:session';

export function loadStoredSession() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    if (!dados.username || !dados.email) return null;
    return {
      username: dados.username,
      displayName: dados.displayName ?? dados.username,
      email: dados.email,
    };
  } catch {
    // Armazenamento bloqueado ou conteúdo corrompido: trata como visitante.
    return null;
  }
}

export function storeSession(session) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(session));
  } catch {
    // Sem persistência: a sessão vale apenas para esta aba.
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // Nada a fazer.
  }
}
