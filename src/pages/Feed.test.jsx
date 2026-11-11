import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import { descobrirFilmes, filmesEmAlta } from '../api/discover';
import { listarFeed } from '../api/feed';
import { listarPlaylists } from '../api/playlists';
import Feed from './Feed';

vi.mock('../api/playlists', () => ({ listarPlaylists: vi.fn() }));
vi.mock('../api/discover', () => ({
  descobrirFilmes: vi.fn(),
  filmesEmAlta: vi.fn(),
}));
vi.mock('../api/feed', () => ({ listarFeed: vi.fn() }));

function Local() {
  const { pathname, search } = useLocation();
  return <p data-testid="local">{pathname + search}</p>;
}

function renderizar() {
  renderWithAuth(
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="*" element={<Local />} />
    </Routes>,
  );
}

const filme = (id, titulo, extra = {}) => ({
  tmdb_id: id,
  title: titulo,
  release_date: '2020-01-01',
  poster_path: '/p.jpg',
  tmdb_rating_average: 8,
  ...extra,
});

beforeEach(() => {
  vi.clearAllMocks();
  listarPlaylists.mockResolvedValue({
    results: [{ id: 7, name: 'Favoritos', is_public: true }],
  });
  descobrirFilmes.mockImplementation(async ({ sort }) => ({
    results: [
      sort === 'popularity'
        ? filme(1, 'Dune', { backdrop_path: '/b.jpg', overview: 'Areia.' })
        : filme(2, `Filme ${sort}`),
    ],
  }));
  filmesEmAlta.mockResolvedValue({ results: [filme(3, 'Trending')] });
  listarFeed.mockResolvedValue({ results: [] });
});

describe('Feed', () => {
  it('cumprimenta o usuário logado', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Olá, Davi Almeida' }),
    ).toBeInTheDocument();
  });

  it('mostra as fileiras do catálogo, cada uma com a sua ordenação', async () => {
    renderizar();

    expect(
      await screen.findByRole('link', { name: /Trending/ }),
    ).toHaveAttribute('href', '/filme/3');
    for (const nome of [
      'Destaques do momento',
      'Lançamentos',
      'Mais bem avaliados',
      'Em alta nesta semana',
    ]) {
      expect(screen.getByRole('region', { name: nome })).toBeInTheDocument();
    }
    expect(descobrirFilmes).toHaveBeenCalledWith({ sort: 'popularity' });
    expect(descobrirFilmes).toHaveBeenCalledWith({ sort: 'release_date' });
    expect(descobrirFilmes).toHaveBeenCalledWith({ sort: 'rating' });
  });

  it('abre com um banner do primeiro filme popular, com o fundo dele', async () => {
    renderizar();

    const banner = await screen.findByRole('region', { name: 'Destaque' });
    expect(
      within(banner).getByRole('heading', { name: /Dune/ }),
    ).toBeInTheDocument();
    expect(within(banner).getByText('Areia.')).toBeInTheDocument();
    expect(banner.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('/w1280/b.jpg'),
    );
    expect(
      within(banner).getByRole('link', { name: 'Ver detalhes' }),
    ).toHaveAttribute('href', '/filme/1');
  });

  it('mostra o banner sem imagem quando o filme não tem backdrop', async () => {
    descobrirFilmes.mockResolvedValue({ results: [filme(1, 'Sem Fundo')] });
    renderizar();

    const banner = await screen.findByRole('region', { name: 'Destaque' });
    expect(banner.querySelector('img')).toBeNull();
  });

  it('oculta a fileira que falhou sem quebrar a página', async () => {
    filmesEmAlta.mockRejectedValue(new ApiError(404, 'Não encontrado.'));
    renderizar();

    await screen.findByRole('region', { name: 'Lançamentos' });
    expect(
      screen.queryByRole('region', { name: 'Em alta nesta semana' }),
    ).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Olá, Davi Almeida' }),
    ).toBeInTheDocument();
  });

  it('oculta tudo do catálogo quando a API de filmes falha ou vem vazia', async () => {
    descobrirFilmes.mockRejectedValue(new ApiError(503, 'Fora do ar.'));
    filmesEmAlta.mockResolvedValue({ results: [] });
    renderizar();

    await screen.findByRole('link', { name: /Favoritos/ });
    expect(screen.queryByRole('region', { name: 'Destaque' })).toBeNull();
    expect(
      screen.queryByRole('region', { name: 'Destaques do momento' }),
    ).toBeNull();
    expect(
      screen.queryByRole('region', { name: 'Em alta nesta semana' }),
    ).toBeNull();
  });

  it('mostra as listas reais do usuário', async () => {
    renderizar();

    const link = await screen.findByRole('link', { name: /Favoritos/ });
    expect(link).toHaveAttribute('href', '/lista/7');
  });

  it('convida a criar a primeira lista quando não há nenhuma', async () => {
    listarPlaylists.mockResolvedValue({ results: [] });
    renderizar();

    expect(
      await screen.findByRole('link', { name: 'Criar minha primeira lista' }),
    ).toHaveAttribute('href', '/listas');
  });

  it('mostra o erro da API de listas', async () => {
    listarPlaylists.mockRejectedValue(new ApiError(500, 'Falha no servidor.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha no servidor.',
    );
  });

  it('leva a busca rápida para a tela de busca', async () => {
    renderizar();

    await userEvent.type(screen.getByLabelText('Buscar filme'), 'matrix');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByTestId('local')).toHaveTextContent(
      '/busca?q=matrix',
    );
  });

  it('convida a seguir pessoas quando o feed está vazio', async () => {
    renderizar();

    expect(
      await screen.findByRole('link', {
        name: 'Encontrar pessoas para seguir',
      }),
    ).toHaveAttribute('href', '/membros');
    expect(screen.queryByText('Em breve')).toBeNull();
  });

  it('convida a seguir pessoas se o feed falhar', async () => {
    listarFeed.mockRejectedValue(new ApiError(404, 'Não encontrado.'));
    renderizar();

    expect(
      await screen.findByRole('link', {
        name: 'Encontrar pessoas para seguir',
      }),
    ).toBeInTheDocument();
  });

  it('mostra a atividade de quem o usuário segue', async () => {
    listarFeed.mockResolvedValue({
      results: [
        {
          id: 11,
          content: 'Obra-prima.',
          created_at: '2025-01-02T10:00:00Z',
          author: { username: 'ana' },
          movie: { tmdb_id: 5, title: 'Alien', poster_path: '/a.jpg' },
        },
        {
          id: 12,
          content: 'Segredo.',
          contains_spoiler: true,
          author: { username: 'bia' },
          tmdb_id: 6,
          title: 'Heat',
        },
      ],
    });
    renderizar();

    const atividade = await screen.findByRole('region', { name: 'Atividade' });
    expect(
      await within(atividade).findByText('Obra-prima.'),
    ).toBeInTheDocument();
    expect(
      within(atividade).getByRole('link', { name: 'ana' }),
    ).toHaveAttribute('href', '/u/ana');
    expect(
      within(atividade).getByRole('link', { name: 'Alien' }),
    ).toHaveAttribute('href', '/filme/5');
    expect(
      within(atividade).getByRole('link', { name: 'Heat' }),
    ).toHaveAttribute('href', '/filme/6');
    expect(within(atividade).getByText('Contém spoilers.')).toBeInTheDocument();
    expect(within(atividade).queryByText('Segredo.')).toBeNull();
  });
});
