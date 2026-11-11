import { validarDataNascimento } from '../lib/dataNascimento';

const EMAIL = /^\S+@\S+\.\S+$/;
const USERNAME = /^[\w.@+-]+$/;

export const AVATAR_TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
export const AVATAR_MAX_MB = 5;

export function validarLogin({ identifier, password }) {
  const erros = {};
  if (!identifier.trim()) erros.identifier = 'Informe seu e-mail ou usuário.';
  if (!password) erros.password = 'Informe sua senha.';
  return erros;
}

export function validarEmail(email) {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!EMAIL.test(email.trim())) return 'E-mail inválido.';
  return null;
}

export function validarSenha(senha, vazia = 'Informe a nova senha.') {
  if (!senha) return vazia;
  if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/^\d+$/.test(senha)) return 'A senha não pode ter apenas números.';
  return null;
}

export function validarRecuperacao({ email }) {
  const erro = validarEmail(email);
  return erro ? { email: erro } : {};
}

export function validarRedefinicao({ password, confirmacao }) {
  const erros = {};
  const erroSenha = validarSenha(password);
  if (erroSenha) erros.password = erroSenha;
  if (!confirmacao) erros.confirmacao = 'Repita a nova senha.';
  else if (confirmacao !== password)
    erros.confirmacao = 'As senhas não coincidem.';
  return erros;
}

export function validarCadastro(dados) {
  const erros = {};

  if (!dados.firstName.trim()) erros.firstName = 'Informe seu nome.';
  if (!dados.lastName.trim()) erros.lastName = 'Informe seu sobrenome.';

  const usuario = dados.username.trim();
  if (!usuario) erros.username = 'Escolha um nome de usuário.';
  else if (usuario.length > 150) erros.username = 'Máximo de 150 caracteres.';
  else if (!USERNAME.test(usuario))
    erros.username = 'Use letras, números e @ . + - _ (sem espaços).';

  const erroEmail = validarEmail(dados.email);
  if (erroEmail) erros.email = erroEmail;

  // birthDate chega no formato dd/mm/aaaa (o da máscara do formulário).
  if (!dados.birthDate) erros.birthDate = 'Informe sua data de nascimento.';
  else {
    const erroData = validarDataNascimento(dados.birthDate);
    if (erroData) erros.birthDate = erroData;
  }

  const erroSenha = validarSenha(dados.password, 'Escolha uma senha.');
  if (erroSenha) erros.password = erroSenha;

  if (dados.avatar) {
    if (!AVATAR_TIPOS.includes(dados.avatar.type))
      erros.avatar = 'Formato não suportado. Use JPEG, PNG ou WebP.';
    else if (dados.avatar.size > AVATAR_MAX_MB * 1024 * 1024)
      erros.avatar = `A imagem deve ter no máximo ${AVATAR_MAX_MB}MB.`;
  }

  return erros;
}

const CAMPOS_DA_API = {
  first_name: 'firstName',
  last_name: 'lastName',
  birth_date: 'birthDate',
};

export function errosDaApiNoFormulario(fieldErrors) {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([campo, msg]) => [
      CAMPOS_DA_API[campo] ?? campo,
      msg,
    ]),
  );
}
