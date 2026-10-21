export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

const GENERICA =
  'Não foi possível completar a operação. Tente novamente em instantes.';
const SEM_CONEXAO =
  'Sem conexão com o servidor. Verifique sua internet e tente de novo.';

// O back responde em inglês (LANGUAGE_CODE en-us).
const TRADUCOES = [
  [
    /user with this email already exists/i,
    'Já existe uma conta com este e-mail.',
  ],
  [
    /user with that username already exists/i,
    'Este nome de usuário já existe.',
  ],
  [/password is too short/i, 'A senha precisa ter pelo menos 8 caracteres.'],
  [/password is too common/i, 'Esta senha é comum demais. Escolha outra.'],
  [/password is entirely numeric/i, 'A senha não pode ter apenas números.'],
  [/password is too similar/i, 'A senha está parecida demais com seus dados.'],
  [/enter a valid email/i, 'E-mail inválido.'],
  [/this field is required|this field may not be blank/i, 'Campo obrigatório.'],
  [/invalid credentials/i, 'E-mail, usuário ou senha incorretos.'],
];

export function traduzir(mensagem) {
  const achada = TRADUCOES.find(([padrao]) => padrao.test(mensagem));
  return achada ? achada[1] : mensagem;
}

function primeira(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export function erroDaResposta(status, dados) {
  if (status >= 500 || !dados || typeof dados !== 'object') {
    return new ApiError(status, GENERICA);
  }

  const direta = dados.error ?? dados.detail;
  if (typeof direta === 'string') {
    return new ApiError(status, traduzir(direta));
  }

  const fieldErrors = {};
  let geral;
  for (const [campo, valor] of Object.entries(dados)) {
    const mensagem = primeira(valor);
    if (typeof mensagem !== 'string') continue;
    if (campo === 'non_field_errors') geral = traduzir(mensagem);
    else fieldErrors[campo] = traduzir(mensagem);
  }

  const mensagem =
    geral ??
    (Object.keys(fieldErrors).length > 0
      ? 'Confira os campos destacados.'
      : GENERICA);
  return new ApiError(status, mensagem, fieldErrors);
}

export function erroDeRede() {
  return new ApiError(0, SEM_CONEXAO);
}
