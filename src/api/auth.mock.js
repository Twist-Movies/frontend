/**
 * Autenticação simulada, para rodar o front sem o back-end
 * (VITE_API_MOCK=true). Imita os status e o formato de erro do Django.
 */
import { ApiError } from './errors';
import { clearTokens, setTokens } from './tokens';

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

function tokensFalsos(conta) {
  setTokens({
    access: `mock-access-${conta.username}`,
    refresh: 'mock-refresh',
  });
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

  tokensFalsos(conta);
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

  tokensFalsos(conta);
  return paraSessao(conta);
}

export async function logout() {
  clearTokens();
}
