import { anoDe } from './tmdbImage';

// Gêneros do TMDB (ids fixos, nomes em português).
export const GENEROS = [
  { id: 28, nome: 'Ação' },
  { id: 12, nome: 'Aventura' },
  { id: 16, nome: 'Animação' },
  { id: 35, nome: 'Comédia' },
  { id: 80, nome: 'Crime' },
  { id: 99, nome: 'Documentário' },
  { id: 18, nome: 'Drama' },
  { id: 10751, nome: 'Família' },
  { id: 14, nome: 'Fantasia' },
  { id: 36, nome: 'História' },
  { id: 27, nome: 'Terror' },
  { id: 10402, nome: 'Música' },
  { id: 9648, nome: 'Mistério' },
  { id: 10749, nome: 'Romance' },
  { id: 878, nome: 'Ficção científica' },
  { id: 53, nome: 'Suspense' },
  { id: 10752, nome: 'Guerra' },
  { id: 37, nome: 'Faroeste' },
];

export const DECADAS = [2020, 2010, 2000, 1990, 1980, 1970, 1960];

export const DURACOES = [
  { id: 'curta', rotulo: 'Até 90 min', max: 90 },
  { id: 'media', rotulo: '90 a 120 min', min: 90, max: 120 },
  { id: 'longa', rotulo: 'Mais de 120 min', min: 120 },
];

// `min` está na escala do TMDB (0 a 10); o rótulo, na do Twist (0 a 5).
export const NOTAS = [
  { id: '6', rotulo: '3 estrelas ou mais', min: 6 },
  { id: '7', rotulo: '3,5 estrelas ou mais', min: 7 },
  { id: '8', rotulo: '4 estrelas ou mais', min: 8 },
  { id: '9', rotulo: '4,5 estrelas ou mais', min: 9 },
];

export const ORDENACOES = [
  { id: 'popularidade', rotulo: 'Popularidade', api: 'popularity' },
  { id: 'nota', rotulo: 'Nota média', api: 'rating' },
  { id: 'lancamento', rotulo: 'Data de lançamento', api: 'release_date' },
];

export const FILTROS_VAZIOS = {
  q: '',
  genero: '',
  decada: '',
  duracao: '',
  nota: '',
  ordem: 'popularidade',
};

const VALIDADORES = {
  genero: (v) => GENEROS.some((genero) => String(genero.id) === v),
  decada: (v) => DECADAS.some((decada) => String(decada) === v),
  duracao: (v) => DURACOES.some((duracao) => duracao.id === v),
  nota: (v) => NOTAS.some((nota) => nota.id === v),
  ordem: (v) => ORDENACOES.some((ordem) => ordem.id === v),
};

// Lê os filtros do endereço, descartando valores desconhecidos.
export function filtrosDaUrl(params) {
  const filtros = { ...FILTROS_VAZIOS, q: (params.get('q') ?? '').trim() };
  for (const [campo, valido] of Object.entries(VALIDADORES)) {
    const valor = params.get(campo);
    if (valor && valido(valor)) filtros[campo] = valor;
  }
  return filtros;
}

// Grava só o que difere do padrão, para o endereço ficar curto.
export function paraUrl(filtros) {
  const params = new URLSearchParams();
  for (const [campo, valor] of Object.entries(filtros)) {
    if (valor && valor !== FILTROS_VAZIOS[campo]) params.set(campo, valor);
  }
  return params;
}

// Há algo além da busca por título que dê para limpar?
export function temFiltros(filtros) {
  return Object.keys(VALIDADORES).some(
    (campo) => filtros[campo] !== FILTROS_VAZIOS[campo],
  );
}

export function paraApi(filtros) {
  const duracao = DURACOES.find((item) => item.id === filtros.duracao);
  const nota = NOTAS.find((item) => item.id === filtros.nota);
  return {
    sort: ORDENACOES.find((item) => item.id === filtros.ordem)?.api,
    genre: filtros.genero || undefined,
    decade: filtros.decada || undefined,
    runtimeMin: duracao?.min,
    runtimeMax: duracao?.max,
    ratingMin: nota?.min,
  };
}

// Modo sem catálogo: a busca do TMDB só traz data e nota, então só dá para
// filtrar por década e nota e ordenar por nota ou data. "Popularidade" mantém
// a ordem em que o TMDB devolveu os resultados.
export function aplicarFiltrosLocais(filmes, filtros) {
  const decada = filtros.decada ? Number(filtros.decada) : null;
  const notaMinima = NOTAS.find((item) => item.id === filtros.nota)?.min ?? 0;

  const filtrados = filmes.filter((filme) => {
    const ano = anoDe(filme.release_date);
    if (decada !== null && (ano === undefined || ano < decada || ano >= decada + 10)) {
      return false;
    }
    return !notaMinima || filme.tmdb_rating_average >= notaMinima;
  });

  if (filtros.ordem === 'nota') {
    return [...filtrados].sort(
      (a, b) => (b.tmdb_rating_average ?? 0) - (a.tmdb_rating_average ?? 0),
    );
  }
  if (filtros.ordem === 'lancamento') {
    return [...filtrados].sort((a, b) =>
      (b.release_date ?? '').localeCompare(a.release_date ?? ''),
    );
  }
  return filtrados;
}
