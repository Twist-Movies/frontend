const CHAVE = 'twist:tokens';

export function getTokens() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    if (dados?.access && dados?.refresh) return dados;
  } catch {}
  return null;
}

export function setTokens({ access, refresh }) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ access, refresh }));
  } catch {}
}

export function clearTokens() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
}
