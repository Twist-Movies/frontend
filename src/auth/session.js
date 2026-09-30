/**
 * Perfil da sessão atual guardado no navegador (nome, e-mail), para a tela
 * não piscar como visitante ao recarregar. Os tokens ficam em api/tokens.js:
 * sem eles, o perfil guardado não vale nada.
 */
import { getTokens } from '../api/tokens';

const CHAVE = 'twist:session';

export function loadStoredSession() {
  try {
    if (!getTokens()) return null;
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    if (!dados?.username) return null;
    return {
      username: dados.username,
      displayName: dados.displayName ?? dados.username,
      email: dados.email,
      avatarUrl: dados.avatarUrl,
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
