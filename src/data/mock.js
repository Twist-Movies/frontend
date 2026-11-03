export const films = [
  {
    id: '1',
    title: 'Cidade de Deus',
    year: 2002,
    director: 'Fernando Meirelles',
    runtime: 130,
    genres: ['Drama', 'Crime'],
    synopsis:
      'Dois garotos crescem na periferia do Rio e seguem caminhos opostos.',
    averageRating: 4.5,
    watchedCount: 128340,
  },
  {
    id: '2',
    title: 'Bacurau',
    year: 2019,
    director: 'Kleber Mendonça Filho',
    runtime: 131,
    genres: ['Suspense', 'Faroeste'],
    synopsis:
      'Um povoado do sertão some do mapa e passa a receber visitantes estranhos.',
    averageRating: 4.1,
    watchedCount: 64210,
  },
  {
    id: '3',
    title: 'Central do Brasil',
    year: 1998,
    director: 'Walter Salles',
    runtime: 113,
    genres: ['Drama'],
    synopsis:
      'Uma ex-professora atravessa o país com um menino em busca do pai.',
    averageRating: 4.2,
    watchedCount: 41905,
  },
  {
    id: '4',
    title: 'O Auto da Compadecida',
    year: 2000,
    director: 'Guel Arraes',
    runtime: 104,
    genres: ['Comédia', 'Aventura'],
    synopsis:
      'Dois amigos driblam a miséria do sertão com lábia e malandragem.',
    averageRating: 4.6,
    watchedCount: 88120,
  },
  {
    id: '5',
    title: 'Tropa de Elite',
    year: 2007,
    director: 'José Padilha',
    runtime: 115,
    genres: ['Ação', 'Crime'],
    synopsis:
      'Um capitão do BOPE procura um substituto antes de deixar a corporação.',
    averageRating: 4.0,
    watchedCount: 97540,
  },
  {
    id: '6',
    title: 'Ainda Estou Aqui',
    year: 2024,
    director: 'Walter Salles',
    runtime: 137,
    genres: ['Drama', 'História'],
    synopsis:
      'Uma família é forçada a se reinventar após um desaparecimento na ditadura.',
    averageRating: 4.7,
    watchedCount: 152300,
  },
];

export const series = [
  {
    id: '1',
    title: 'Cidade Invisível',
    startYear: 2021,
    endYear: 2023,
    creator: 'Carlos Saldanha',
    seasons: 2,
    genres: ['Fantasia', 'Suspense'],
    synopsis:
      'Um policial ambiental descobre criaturas do folclore vivendo no Rio.',
    averageRating: 3.9,
    watchedCount: 38210,
  },
  {
    id: '2',
    title: 'Sintonia',
    startYear: 2019,
    endYear: 2025,
    creator: 'KondZilla',
    seasons: 5,
    genres: ['Drama', 'Música'],
    synopsis:
      'Três amigos de uma quebrada de São Paulo seguem caminhos diferentes.',
    averageRating: 4.0,
    watchedCount: 45120,
  },
  {
    id: '3',
    title: 'Sessão de Terapia',
    startYear: 2012,
    endYear: 2021,
    creator: 'Selton Mello',
    seasons: 5,
    genres: ['Drama'],
    synopsis:
      'Cada episódio acompanha uma sessão de um terapeuta com um paciente.',
    averageRating: 4.4,
    watchedCount: 21870,
  },
  {
    id: '4',
    title: 'Cangaço Novo',
    startYear: 2023,
    creator: 'Mariana Bardan e Eduardo Melo',
    seasons: 1,
    genres: ['Ação', 'Faroeste'],
    synopsis:
      'Um bancário de São Paulo volta ao sertão e herda um legado de cangaço.',
    averageRating: 4.3,
    watchedCount: 29540,
  },
  {
    id: '5',
    title: 'Irmandade',
    startYear: 2019,
    endYear: 2022,
    creator: 'Pedro Morelli',
    seasons: 2,
    genres: ['Crime', 'Drama'],
    synopsis:
      'Uma advogada é forçada a se infiltrar na facção comandada pelo irmão.',
    averageRating: 3.8,
    watchedCount: 26300,
  },
  {
    id: '6',
    title: 'Os Normais',
    startYear: 2001,
    endYear: 2003,
    creator: 'Alexandre Machado e Fernanda Young',
    seasons: 3,
    genres: ['Comédia'],
    synopsis: 'O cotidiano de um casal comum e nada normal no Rio de Janeiro.',
    averageRating: 4.2,
    watchedCount: 33990,
  },
];

export const currentUser = {
  username: 'davi',
  displayName: 'Davi Almeida',
  bio: 'Construindo o TWIST.',
  followers: 42,
  following: 87,
  filmsWatched: 213,
};

export const activity = [
  {
    id: 'a1',
    kind: 'reviewed',
    username: 'marina',
    createdAt: '2026-08-25',
    filmId: '6',
    reviewId: 'r1',
    rating: 5,
  },
  {
    id: 'a2',
    kind: 'watched',
    username: 'joao',
    createdAt: '2026-08-25',
    filmId: '2',
    rating: 4,
  },
  {
    id: 'a3',
    kind: 'liked',
    username: 'bia',
    createdAt: '2026-08-24',
    filmId: '4',
  },
  {
    id: 'a4',
    kind: 'listed',
    username: 'marina',
    createdAt: '2026-08-24',
    listId: 'l1',
  },
  {
    id: 'a5',
    kind: 'watched',
    username: 'carlos',
    createdAt: '2026-08-23',
    filmId: '1',
    rating: 3,
  },
];

export function filmById(id) {
  return films.find((f) => f.id === id);
}

export function seriesById(id) {
  return series.find((s) => s.id === id);
}
