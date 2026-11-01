import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import { detalheDoFilme, marcarAssistido } from '../api/movies';
import { criarResenha, listarResenhas } from '../api/reviews';
import { adicionarFilmeNaPlaylist, listarPlaylists } from '../api/playlists';
import FilmDetail from './FilmDetail';

vi.mock('../api/movies', () => ({
  detalheDoFilme: vi.fn(),
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
  genres: ['Ação', 'Ficção científica'],
  cast: [{ name: 'Keanu Reeves', character: 'Neo', profile_path: null }],
  crew: [
    { name: 'Lana Wachowski', job: 'Director', profile_path: null },
    { name: 'Joel Silver', job: 'Producer', profile_path: null },
  ],
  tmdb_rating_average: 8.2,
  tmdb_rating_count: 100,
  stats: {
    likes_count: 7,
    dislikes_count: 1,
    watched_count: 30,
    rating_average: 4.5,
    rating_count: 10,
  },
  user_state: { watched: false, in_watchlist: false, reaction: null, rating: null },
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
    expect(screen.getByText('1999 · 2h 16min · 14')).toBeInTheDocument();
    expect(screen.getByText('Lana Wachowski')).toBeInTheDocument();
    expect(screen.queryByText('Joel Silver')).toBeNull();
    expect(screen.getByText('Ficção científica')).toBeInTheDocument();
    expect(screen.getByText('Um hacker descobre a verdade.')).toBeInTheDocument();
    expect(screen.getByText('Keanu Reeves')).toBeInTheDocument();
    expect(screen.getByText(/10 avaliações no/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pôster de Matrix' })).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/m.jpg',
    );
  });

  it('mostra as resenhas do filme', async () => {
    renderizar();

    expect(await screen.findByText('Clássico absoluto')).toBeInTheDocument();
    expect(listarResenhas).toHaveBeenCalledWith('603', 1);
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

  it('publica uma resenha e recarrega a lista', async () => {
    criarResenha.mockResolvedValue({});
    renderizar();
    await screen.findByText('Clássico absoluto');

    await userEvent.type(
      screen.getByLabelText('Escreva sua resenha'),
      'Genial',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Publicar resenha' }),
    );

    await waitFor(() => expect(listarResenhas).toHaveBeenCalledTimes(2));
    expect(criarResenha).toHaveBeenCalledWith(603, {
      content: 'Genial',
      containsSpoiler: false,
    });
  });

  it('mostra o erro de resenha duplicada', async () => {
    criarResenha.mockRejectedValue(
      new ApiError(400, 'Você já possui uma resenha ativa para este filme.'),
    );
    renderizar();
    await screen.findByText('Clássico absoluto');

    await userEvent.type(screen.getByLabelText('Escreva sua resenha'), 'Outra');
    await userEvent.click(
      screen.getByRole('button', { name: 'Publicar resenha' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você já possui uma resenha ativa',
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
});
