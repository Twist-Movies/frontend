import { useCallback, useEffect, useRef, useState } from 'react';

// A API do TMDB não entrega além da página 500.
const LIMITE_DE_PAGINAS = 500;
const INICIAL = {
  itens: [],
  pagina: 0,
  totalPaginas: null,
  loading: true,
  error: null,
};

// Lista paginada com carga automática: quando o elemento `sentinelaRef` entra
// na tela, busca a próxima página. `carregarPagina(n)` devolve
// { results, total_pages }. A lista recomeça quando `deps` mudam.
export function useListaInfinita(carregarPagina, deps) {
  const [estado, setEstado] = useState(INICIAL);
  const [sentinela, setSentinela] = useState(null);
  const geracao = useRef(0);
  const emAndamento = useRef(false);
  const carregarRef = useRef(carregarPagina);
  const estadoRef = useRef(estado);

  useEffect(() => {
    carregarRef.current = carregarPagina;
    estadoRef.current = estado;
  });

  const buscar = useCallback(async (pagina) => {
    const minha = geracao.current;
    emAndamento.current = true;
    setEstado((atual) => ({ ...atual, loading: true, error: null }));
    try {
      const dados = await carregarRef.current(pagina);
      if (minha !== geracao.current) return;
      setEstado((atual) => ({
        itens:
          pagina === 1 ? dados.results : [...atual.itens, ...dados.results],
        pagina,
        totalPaginas: dados.total_pages ?? 1,
        loading: false,
        error: null,
      }));
    } catch (error) {
      if (minha !== geracao.current) return;
      setEstado((atual) => ({ ...atual, loading: false, error }));
    } finally {
      if (minha === geracao.current) emAndamento.current = false;
    }
  }, []);

  useEffect(() => {
    geracao.current += 1;
    emAndamento.current = false;
    setEstado(INICIAL);
    buscar(1);
    // `deps` define quando a lista recomeça.
  }, [...deps, buscar]);

  const carregarMais = useCallback(() => {
    const { pagina, totalPaginas, error } = estadoRef.current;
    const ultima = Math.min(totalPaginas ?? 0, LIMITE_DE_PAGINAS);
    if (emAndamento.current || error || pagina >= ultima) return;
    buscar(pagina + 1);
  }, [buscar]);

  // Refaz a página que falhou.
  const repetir = useCallback(() => {
    buscar(Math.max(1, estadoRef.current.pagina + 1));
  }, [buscar]);

  useEffect(() => {
    if (
      !sentinela ||
      typeof IntersectionObserver === 'undefined' ||
      estado.loading ||
      estado.error
    ) {
      return undefined;
    }
    // Um observador novo a cada página avisa de novo se o fim da lista ainda
    // está à vista (lista curta ou tela alta).
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) carregarMais();
      },
      { rootMargin: '400px' },
    );
    observador.observe(sentinela);
    return () => observador.disconnect();
  }, [sentinela, estado.loading, estado.error, estado.pagina, carregarMais]);

  const ultimaPagina = Math.min(estado.totalPaginas ?? 0, LIMITE_DE_PAGINAS);

  return {
    itens: estado.itens,
    carregando: estado.loading,
    primeiraCarga: estado.loading && estado.pagina === 0,
    erro: estado.error,
    temMais: estado.pagina < ultimaPagina,
    carregarMais,
    repetir,
    sentinelaRef: setSentinela,
  };
}
