import { useEffect, useState } from 'react';

const STORAGE_KEY = 'twist:theme';

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage indisponível (modo privado, cookies bloqueados) */
  }
  return 'dark';
}

/** Tema persistido no navegador. O TWIST nasce escuro, como o Letterboxd. */
export function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* sem persistência: o tema vale só para esta sessão */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
