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
    return null;
  }
}

export function storeSession(session) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(session));
  } catch {}
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
}
