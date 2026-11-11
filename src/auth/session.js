// A sessão (perfil) vive só em memória no AuthContext. Nada de perfil, e-mail
// ou token é persistido: ao recarregar, o app restaura tudo via cookie de
// refresh + /users/me/. Versões antigas gravavam o perfil (com e-mail) em
// localStorage; esta função apaga esse resquício.
const CHAVE_LEGADA = 'twist:session';

export function limparSessaoLegada() {
  try {
    localStorage.removeItem(CHAVE_LEGADA);
  } catch {}
}
