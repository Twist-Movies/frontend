// Dados de exemplo no formato real da API (ver backend/apps/movies/*serializers.py).

export const SENHA_VALIDA = 'twist1234';

export const USUARIO = {
  id: 1,
  username: 'davi',
  email: 'davi@twist.app',
  first_name: 'Davi',
  last_name: 'Silva',
  birth_date: '1999-05-20',
  bio: '',
  avatar_url: null,
};

export const PESSOAS = [
  USUARIO,
  {
    id: 2,
    username: 'ana',
    first_name: 'Ana',
    last_name: 'Souza',
    avatar_url: null,
  },
  {
    id: 3,
    username: 'bruno',
    first_name: 'Bruno',
    last_name: 'Lima',
    avatar_url: null,
  },
  {
    id: 4,
    username: 'carla',
    first_name: 'Carla',
    last_name: 'Dias',
    avatar_url: null,
  },
];

const resumo = (id, title, ano, nota = 7.6) => ({
  tmdb_id: id,
  title,
  original_title: title,
  overview: `Sinopse de ${title}.`,
  poster_path: `/poster${id}.jpg`,
  backdrop_path: `/backdrop${id}.jpg`,
  release_date: `${ano}-03-31`,
  tmdb_rating_average: nota,
});

const NOMES_POPULARES = [
  'Matrix',
  'Cidade Alta',
  'Rio Fundo',
  'O Último Trem',
  'Sombras do Norte',
  'Maré Vermelha',
  'Horizonte Perdido',
  'Noite Eterna',
  'Vale dos Ventos',
  'Dias de Chuva',
  'Ponte Velha',
  'Cais do Porto',
];

// Cada fileira da home usa filmes distintos para os testes saberem de onde vêm.
export const POPULARES = NOMES_POPULARES.map((nome, i) =>
  resumo(603 + i, nome, 1999 + i),
);
export const LANCAMENTOS = ['Estreia Um', 'Estreia Dois', 'Estreia Três'].map(
  (nome, i) => resumo(701 + i, nome, 2025),
);
export const MELHORES = ['Clássico Um', 'Clássico Dois', 'Clássico Três'].map(
  (nome, i) => resumo(801 + i, nome, 1972, 9),
);
export const EM_ALTA = ['Viral Um', 'Viral Dois', 'Viral Três'].map((nome, i) =>
  resumo(901 + i, nome, 2026),
);
export const SEMELHANTES = [
  'Parecido Um',
  'Parecido Dois',
  'Parecido Três',
].map((nome, i) => resumo(1001 + i, nome, 2003));

export const TODOS_OS_FILMES = [
  ...POPULARES,
  ...LANCAMENTOS,
  ...MELHORES,
  ...EM_ALTA,
  ...SEMELHANTES,
];

export function pagina(results, extra = {}) {
  return {
    page: 1,
    total_pages: 1,
    total_results: results.length,
    results,
    ...extra,
  };
}

export function paginado(results) {
  return { count: results.length, next: null, previous: null, results };
}

export const GENEROS_DO_FILME = [
  { id: 28, name: 'Ação' },
  { id: 878, name: 'Ficção científica' },
];

export function detalheDoFilme(id, estado) {
  const base =
    TODOS_OS_FILMES.find((f) => f.tmdb_id === id) ??
    resumo(id, `Filme ${id}`, 2000);
  return {
    id,
    ...base,
    runtime_minutes: 136,
    certification: '12',
    genres: GENEROS_DO_FILME.map((g) => g.name),
    genres_info: GENEROS_DO_FILME,
    trailer: 'abc123XYZ00',
    cast: [
      {
        id: 6384,
        name: 'Keanu Reeves',
        character: 'Neo',
        profile_path: '/keanu.jpg',
      },
      {
        id: 2975,
        name: 'Laurence Fishburne',
        character: 'Morpheus',
        profile_path: null,
      },
      {
        id: 530,
        name: 'Carrie-Anne Moss',
        character: 'Trinity',
        profile_path: null,
      },
      {
        id: 1331,
        name: 'Hugo Weaving',
        character: 'Agente Smith',
        profile_path: null,
      },
      {
        id: 9999,
        name: 'Joe Pantoliano',
        character: 'Cypher',
        profile_path: null,
      },
    ],
    crew: [
      { id: 9340, name: 'Lana Wachowski', job: 'Director', profile_path: null },
      {
        id: 9341,
        name: 'Lilly Wachowski',
        job: 'Director',
        profile_path: null,
      },
      {
        id: 9342,
        name: 'Bill Pope',
        job: 'Director of Photography',
        profile_path: null,
      },
    ],
    tmdb_rating_count: 25000,
    stats: {
      likes_count: 23,
      dislikes_count: 2,
      approval_percent: 92,
      approval_votes: 25,
      watched_count: 140,
      rating_average: 4.2,
      rating_count: 40,
    },
    user_state: {
      watched: estado.assistido,
      in_watchlist: estado.watchlist,
      reaction: estado.reacao,
      rating: estado.nota,
    },
  };
}

export const PESSOA_DETALHE = {
  id: 9340,
  name: 'Lana Wachowski',
  biography: 'Diretora e roteirista norte-americana.',
  birthday: '1965-06-21',
  place_of_birth: 'Chicago, Illinois, EUA',
  known_for_department: 'Directing',
  profile_path: null,
  movies: [resumo(603, 'Matrix', 1999)],
};

export const REVIEW_EXISTENTE = {
  id: 77,
  movie: {
    id: 1,
    tmdb_id: 603,
    title: 'Matrix',
    original_title: 'The Matrix',
    poster_path: '/poster603.jpg',
    release_date: '1999-03-31',
  },
  author: { id: 2, username: 'ana', avatar_url: null },
  content: 'Um clássico que envelheceu muito bem.',
  contains_spoiler: false,
  likes_count: 3,
  liked_by_me: false,
  created_at: '2026-01-10T12:00:00Z',
  updated_at: '2026-01-10T12:00:00Z',
};

export const PLAYLIST_OFICIAL = {
  id: 500,
  name: 'Essenciais da equipe',
  description: 'Os filmes que a equipe Twist não para de indicar.',
  is_public: true,
  cover_url: null,
  owner_username: 'twist',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// 1x1 PNG transparente.
export const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
