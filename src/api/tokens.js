/**
 * Tokens JWT da sessão (access + refresh), guardados no navegador para a
 * sessão sobreviver a um recarregamento da página.
 */
const CHAVE = 'twist:tokens';

export function getTokens() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    if (dados?.access && dados?.refresh) return dados;
  } catch {
    // Armazenamento bloqueado ou conteúdo corrompido.
  }
  return null;
}

export function setTokens({ access, refresh }) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ access, refresh }));
  } catch {
    // Sem persistência: os tokens se perdem ao recarregar.
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // Nada a fazer.
  }
}
