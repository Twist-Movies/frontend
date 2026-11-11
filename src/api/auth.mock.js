import { ApiError } from './errors';
import { clearAccessToken, setAccessToken } from './tokens';

const CONTAS = [
  {
    username: 'davi',
    email: 'davi@twist.app',
    firstName: 'Davi',
    lastName: 'Almeida',
    password: 'twist1234',
  },
  {
    username: 'marina',
    email: 'marina@twist.app',
    firstName: 'Marina',
    lastName: 'Costa',
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
    displayName: `${conta.firstName} ${conta.lastName}`.trim(),
    email: conta.email,
  };
}

// SIMULAÇÃO do cookie HttpOnly de refresh: só existe no modo mock e guarda
// apenas o username (nenhum segredo real) em sessionStorage, para o app
// "restaurar" a sessão ao recarregar. A API real usa cookie HttpOnly de verdade.
const CHAVE_MOCK = 'twist:mock-refresh';

function abrirSessaoFalsa(conta) {
  setAccessToken(`mock-access-${conta.username}`);
  try {
    sessionStorage.setItem(CHAVE_MOCK, conta.username);
  } catch {}
}

export async function login({ identifier, password }) {
  await esperar(LATENCIA_MS);

  const alvo = identifier.trim().toLowerCase();
  const conta = CONTAS.find(
    (c) => (c.email === alvo || c.username === alvo) && c.password === password,
  );
  if (!conta) {
    throw new ApiError(401, 'E-mail, usuário ou senha incorretos.');
  }

  abrirSessaoFalsa(conta);
  return paraSessao(conta);
}

export async function register(dados) {
  await esperar(LATENCIA_MS);

  const username = dados.username.trim().toLowerCase();
  const email = dados.email.trim().toLowerCase();
  const fieldErrors = {};

  if (CONTAS.some((c) => c.username === username)) {
    fieldErrors.username = 'Este nome de usuário já existe.';
  }
  if (CONTAS.some((c) => c.email === email)) {
    fieldErrors.email = 'Já existe uma conta com este e-mail.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError(400, 'Confira os campos destacados.', fieldErrors);
  }

  const conta = {
    username,
    email,
    firstName: dados.firstName.trim(),
    lastName: dados.lastName.trim(),
    password: dados.password,
  };
  CONTAS.push(conta);

  abrirSessaoFalsa(conta);
  return paraSessao(conta);
}

export async function restore() {
  let username = null;
  try {
    username = sessionStorage.getItem(CHAVE_MOCK);
  } catch {}
  const conta = CONTAS.find((c) => c.username === username);
  if (!conta) return null;
  setAccessToken(`mock-access-${conta.username}`);
  return paraSessao(conta);
}

export async function logout() {
  clearAccessToken();
  try {
    sessionStorage.removeItem(CHAVE_MOCK);
  } catch {}
}

export async function solicitarRecuperacaoSenha() {
  await esperar(LATENCIA_MS);
}

// No modo simulado só o token 'valido' funciona; ele redefine a senha de davi.
export async function redefinirSenha({ uid, token, password }) {
  await esperar(LATENCIA_MS);

  if (token !== 'valido') {
    throw new ApiError(400, 'Link inválido ou expirado.');
  }
  const conta = CONTAS.find((c) => c.username === uid) ?? CONTAS[0];
  conta.password = password;
}
