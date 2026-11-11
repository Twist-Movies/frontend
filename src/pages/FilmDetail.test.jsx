import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import {
  detalheDaPessoa,
  detalheDoFilme,
  filmesRecomendados,
  marcarAssistido,
} from '../api/movies';
import { criarResenha, listarResenhas } from '../api/reviews';
import { adicionarFilmeNaPlaylist, listarPlaylists } from '../api/playlists';
import FilmDetail from './FilmDetail';

vi.mock('../api/movies', () => ({
  detalheDoFilme: vi.fn(),
  filmesRecomendados: vi.fn(),
  detalheDaPessoa: vi.fn(),
  marcarAssistido: vi.fn(),
  desmarcarAssistido: vi.fn(),
  adicionarAWatchlist: vi.fn(),
  removerDaWatchlist: vi.fn(),
  avaliarFilme: vi.fn(),
  removerAvaliacao: vi.fn(),
  reagirAoFilme: vi.fn(),
  removerReacao: vi.fn(),
}));
vi.mock('../api/reviews', () => ({
  listarResenhas: vi.fn(),
  criarResenha: vi.fn(),
  curtirResenha: vi.fn(),
  descurtirResenha: vi.fn(),
}));
vi.mock('../api/playlists', () => ({
  listarPlaylists: vi.fn(),
  adicionarFilmeNaPlaylist: vi.fn(),
}));

const FILME = {
  id: 1,
  tmdb_id: 603,
  title: 'Matrix',
  original_title: 'The Matrix',
  overview: 'Um hacker descobre a verdade.',
  poster_path: '/m.jpg',
  release_date: '1999-03-30',
  runtime_minutes: 136,
  certification: '14',
  backdrop_path: '/b.jpg',
  trailer: 'abc123',
  genres: ['Ação', 'Ficção científica'],
  genres_info: [
    { id: 28, name: 'Ação' },
    { id: 878, name: 'Ficção científica' },
  ],
  cast: [
    { id: 6384, name: 'Keanu Reeves', character: 'Neo', profile_path: null },
  ],
  crew: [
    { id: 9340, name: 'Lana Wachowski', job: 'Director', profile_path: null },
    { id: 1, name: 'Joel Silver', job: 'Producer', profile_path: null },
  ],
  tmdb_rating_average: 8.2,
  tmdb_rating_count: 100,
  stats: {
    likes_count: 7,
    dislikes_count: 1,
    watched_count: 30,
    rating_average: 4.5,
    rating_count: 10,
    approval_percent: 87,
    approval_votes: 12,
  },
  user_state: {
    watched: false,
    in_watchlist: false,
    reaction: null,
    rating: null,
  },
};

const RESENHAS = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 9,
      author: { id: 2, username: 'ana', avatar_url: null },
      content: 'Clássico absoluto',
      contains_spoiler: false,
      likes_count: 0,
      liked_by_me: false,
      created_at: '2026-10-20T15:00:00Z',
    },
  ],
};

function renderizar() {
  renderWithAuth(
    <Routes>
      <Route path="/filme/:filmId" element={<FilmDetail />} />
    </Routes>,
    { route: '/filme/603' },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  detalheDoFilme.mockResolvedValue(FILME);
  listarResenhas.mockResolvedValue(RESENHAS);
  filmesRecomendados.mockResolvedValue({ results: [] });
  marcarAssistido.mockResolvedValue({});
});

describe('FilmDetail', () => {
  it('mostra os dados do filme', async () => {
    renderizar();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Matrix' }),
    ).toBeInTheDocument();
    expect(detalheDoFilme).toHaveBeenCalledWith('603');
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('1999 · 2h 16min')).toBeInTheDocument();
    expect(screen.getAllByText('Lana Wachowski').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('img', { name: 'Classificação indicativa: 14 anos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ficção científica' }),
    ).toHaveAttribute('href', '/filmes?genero=878');
    expect(
      screen.getByText('Um hacker descobre a verdade.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Keanu Reeves')).toBeInTheDocument();
    expect(screen.getByText(/10 avaliações no/)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Pôster de Matrix' }),
    ).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/m.jpg');
  });

  it('mostra os comentários do filme', async () => {
    renderizar();

    expect(await screen.findByText('Clássico absoluto')).toBeInTheDocument();
    expect(listarResenhas).toHaveBeenCalledWith(603, 1);
  });

  it('não mostra ações quando a API não devolve o estado do usuário', async () => {
    detalheDoFilme.mockResolvedValue({ ...FILME, user_state: null });
    renderizar();

    await screen.findByRole('heading', { level: 1, name: 'Matrix' });
    expect(screen.queryByTestId('film-actions')).toBeNull();
  });

  it('avisa quando ainda não há avaliações no Twist', async () => {
    detalheDoFilme.mockResolvedValue({
      ...FILME,
      stats: { ...FILME.stats, rating_average: null, rating_count: 0 },
    });
    renderizar();

    expect(
      await screen.findByText('Ainda sem avaliações no Twist'),
    ).toBeInTheDocument();
  });

  it('recarrega o filme depois de uma ação', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Matrix' });

    await userEvent.click(screen.getByRole('button', { name: 'Assistido' }));

    await waitFor(() => expect(detalheDoFilme).toHaveBeenCalledTimes(2));
    expect(marcarAssistido).toHaveBeenCalledWith(603);
  });

  it('publica um comentário e recarrega a lista', async () => {
    criarResenha.mockResolvedValue({});
    renderizar();
    await screen.findByText('Clássico absoluto');

    await userEvent.type(
      screen.getByLabelText('Escreva seu comentário'),
      'Genial',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Publicar comentário' }),
    );

    await waitFor(() => expect(listarResenhas).toHaveBeenCalledTimes(2));
    expect(criarResenha).toHaveBeenCalledWith(603, {
      content: 'Genial',
      containsSpoiler: false,
    });
  });

  it('mostra o erro de comentário duplicado', async () => {
    criarResenha.mockRejectedValue(
      new ApiError(400, 'Você já possui um comentário ativo para este filme.'),
    );
    renderizar();
    await screen.findByText('Clássico absoluto');

    await userEvent.type(
      screen.getByLabelText('Escreva seu comentário'),
      'Outra',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Publicar comentário' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você já possui um comentário ativo',
    );
  });

  it('adiciona o filme a uma lista', async () => {
    listarPlaylists.mockResolvedValue({
      results: [{ id: 7, name: 'Favoritos', is_public: true }],
    });
    adicionarFilmeNaPlaylist.mockResolvedValue({});
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Matrix' });

    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar a uma lista' }),
    );
    const dialogo = await screen.findByRole('dialog', {
      name: 'Adicionar a uma lista',
    });
    await userEvent.click(
      await within(dialogo).findByRole('button', { name: /Favoritos/ }),
    );

    expect(adicionarFilmeNaPlaylist).toHaveBeenCalledWith(7, 603);
    expect(await within(dialogo).findByRole('status')).toHaveTextContent(
      'Filme adicionado a “Favoritos”.',
    );
  });

  it('mostra erro e permite tentar de novo', async () => {
    detalheDoFilme.mockRejectedValueOnce(
      new ApiError(404, 'Filme não encontrado no TMDB.'),
    );
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Filme não encontrado no TMDB.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Matrix' }),
    ).toBeInTheDocument();
  });

  it('mostra a aprovação com o número de votos', async () => {
    renderizar();

    expect(await screen.findByText('87% de aprovação')).toBeInTheDocument();
    expect(screen.getByText('(12 votos)')).toBeInTheDocument();
  });

  it('avisa quando não há votos suficientes', async () => {
    detalheDoFilme.mockResolvedValue({
      ...FILME,
      stats: { ...FILME.stats, approval_percent: null, approval_votes: 1 },
    });
    renderizar();

    expect(
      await screen.findByText('Ainda sem votos suficientes'),
    ).toBeInTheDocument();
  });

  it('se omite sem trailer, backdrop, equipe e campos novos', async () => {
    detalheDoFilme.mockResolvedValue({
      ...FILME,
      trailer: null,
      backdrop_path: null,
      genres_info: undefined,
      crew: undefined,
      cast: undefined,
      stats: { ...FILME.stats, approval_percent: undefined },
    });
    renderizar();

    await screen.findByRole('heading', { level: 1, name: 'Matrix' });
    expect(screen.queryByRole('button', { name: /trailer/i })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Equipe técnica' })).toBeNull();
  });

  it('toca o trailer ao clicar no play', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Matrix' });

    await userEvent.click(
      screen.getByRole('button', { name: 'Assistir ao trailer de Matrix' }),
    );

    expect(screen.getByTitle('Trailer de Matrix')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1',
    );
  });

  it('amplia o pôster e devolve o foco ao fechar', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Matrix' });
    const botao = screen.getByRole('button', { name: 'Ampliar pôster' });

    await userEvent.click(botao);
    const dialogo = screen.getByRole('dialog', { name: 'Pôster de Matrix' });
    expect(within(dialogo).getByRole('img')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w780/m.jpg',
    );
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(botao).toHaveFocus();
  });

  it('abre a ficha do diretor e carrega a pessoa', async () => {
    detalheDaPessoa.mockResolvedValue({
      id: 9340,
      name: 'Lana Wachowski',
      biography: 'Diretora.',
      movies: [],
    });
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Matrix' });

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Lana Wachowski' })[0],
    );

    expect(await screen.findByText('Diretora.')).toBeInTheDocument();
    expect(detalheDaPessoa).toHaveBeenCalledWith(9340);
  });

  it('mostra filmes semelhantes quando existem', async () => {
    filmesRecomendados.mockResolvedValue({
      results: [
        {
          tmdb_id: 604,
          title: 'Matrix Reloaded',
          poster_path: null,
          release_date: '2003-05-15',
        },
      ],
    });
    renderizar();

    expect(
      await screen.findByText(
        'Se você gostou deste filme, talvez goste destes',
      ),
    ).toBeInTheDocument();
    expect(filmesRecomendados).toHaveBeenCalledWith(603);
    expect(
      screen.getByRole('link', { name: 'Matrix Reloaded (2003)' }),
    ).toBeInTheDocument();
  });

  it('esconde os semelhantes se a API falhar', async () => {
    filmesRecomendados.mockRejectedValue(new ApiError(503, 'Fora do ar.'));
    renderizar();

    await screen.findByRole('heading', { level: 1, name: 'Matrix' });
    await waitFor(() => expect(filmesRecomendados).toHaveBeenCalled());
    expect(screen.queryByText(/talvez goste destes/)).toBeNull();
  });
});
