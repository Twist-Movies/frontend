// O access token vive só em memória (variável de módulo): nunca vai para
// localStorage/sessionStorage/cookie legível, então um XSS não consegue
// roubá-lo de um armazenamento persistente. O refresh token fica num cookie
// HttpOnly que o JavaScript nunca enxerga.
let access = null;

export function getAccessToken() {
  return access;
}

export function setAccessToken(token) {
  access = token || null;
}

export function clearAccessToken() {
  access = null;
}

// Versões antigas guardavam o par de tokens em localStorage. Apaga o resquício
// (quem ainda tinha sessão antiga precisa entrar de novo).
export const CHAVE_LEGADA = 'twist:tokens';

export function limparTokensLegados() {
  try {
    localStorage.removeItem(CHAVE_LEGADA);
  } catch {}
}

limparTokensLegados();
