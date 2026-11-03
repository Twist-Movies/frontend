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

function hoje() {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
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

  if (!dados.email.trim()) erros.email = 'Informe seu e-mail.';
  else if (!EMAIL.test(dados.email.trim())) erros.email = 'E-mail inválido.';

  if (!dados.birthDate) erros.birthDate = 'Informe sua data de nascimento.';
  else if (dados.birthDate > hoje())
    erros.birthDate = 'A data de nascimento não pode ser no futuro.';

  if (!dados.password) erros.password = 'Escolha uma senha.';
  else if (dados.password.length < 8)
    erros.password = 'A senha precisa ter pelo menos 8 caracteres.';
  else if (/^\d+$/.test(dados.password))
    erros.password = 'A senha não pode ter apenas números.';

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
