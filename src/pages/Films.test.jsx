import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/utils';
import { ApiError } from '../api/errors';
import { descobrirFilmes } from '../api/discover';
import { buscarFilmes } from '../api/movies';
import Films from './Films';

vi.mock('../api/discover', () => ({ descobrirFilmes: vi.fn() }));
vi.mock('../api/movies', () => ({ buscarFilmes: vi.fn() }));

const filme = (id, titulo, data = '2000-01-01', nota = 7) => ({
  tmdb_id: id,
  title: titulo,
  release_date: data,
  poster_path: '/p.jpg',
  tmdb_rating_average: nota,
});

const PAGINA_1 = {
  page: 1,
  total_pages: 2,
  total_results: 4,
  results: [filme(1, 'Matrix', '1999-03-30', 8.2), filme(2, 'Alien', '1979-05-25', 8.4)],
};
const PAGINA_2 = {
  page: 2,
  total_pages: 2,
  total_results: 4,
  results: [filme(3, 'Heat', '1995-12-15', 7.9)],
};

function renderizar(route = '/filmes') {
  renderWithRouter(<Films />, { route });
}

beforeEach(() => {
  vi.clearAllMocks();
  descobrirFilmes.mockImplementation(async ({ page }) =>
    page === 2 ? PAGINA_2 : PAGINA_1,
  );
});

describe('Films (com catálogo)', () => {
  it('mostra a grade de pôsteres ordenada por popularidade', async () => {
    renderizar();

    const matrix = await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(matrix).toHaveAttribute('href', '/filme/1');
    expect(descobrirFilmes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, sort: 'popularity' }),
    );
    expect(screen.queryByText(/depende de uma rota do back-end/)).toBeNull();
  });

  it('carrega a próxima página e junta os filmes', async () => {
    renderizar();
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));

    expect(await screen.findByRole('link', { name: 'Heat (1995)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Matrix (1999)' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull();
  });

  it('refaz a consulta no servidor ao escolher um filtro', async () => {
    renderizar();
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    await userEvent.selectOptions(screen.getByLabelText('Gênero'), 'Drama');

    await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(descobrirFilmes).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, genre: '18' }),
    );
  });

  it('lê os filtros do endereço e os envia ao servidor', async () => {
    renderizar('/filmes?genero=18&decada=1990&duracao=curta&nota=8&ordem=nota');
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    expect(descobrirFilmes).toHaveBeenCalledWith({
      page: 1,
      sort: 'rating',
      genre: '18',
      decade: '1990',
      runtimeMax: 90,
      ratingMin: 8,
    });
    expect(screen.getByLabelText('Gênero')).toHaveValue('18');
    expect(screen.getByLabelText('Ordenar por')).toHaveValue('nota');
  });

  it('limpa os filtros', async () => {
    renderizar('/filmes?genero=18&nota=8');
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(screen.getByLabelText('Gênero')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).toBeNull();
  });

  it('avisa quando nenhum filme atende aos filtros', async () => {
    descobrirFilmes.mockResolvedValue({ page: 1, total_pages: 0, results: [] });
    renderizar('/filmes?genero=99');

    expect(await screen.findByText('Nenhum filme encontrado')).toBeInTheDocument();
  });

  it('mostra o erro da API e permite tentar de novo', async () => {
    descobrirFilmes.mockRejectedValueOnce(new ApiError(503, 'TMDB indisponível.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('TMDB indisponível.');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByRole('link', { name: 'Matrix (1999)' }),
    ).toBeInTheDocument();
  });

  it('não repete filmes que o TMDB devolve em duas páginas', async () => {
    descobrirFilmes.mockImplementation(async ({ page }) =>
      page === 2
        ? { page: 2, total_pages: 2, results: [PAGINA_1.results[0]] }
        : PAGINA_1,
    );
    renderizar();
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull(),
    );
    const grade = screen.getByLabelText('Filmes');
    expect(within(grade).getAllByRole('link')).toHaveLength(2);
  });
});

describe('Films (sem catálogo no back)', () => {
  const resultadosDaBusca = {
    page: 1,
    total_pages: 1,
    results: [
      filme(10, 'Antigo', '1995-05-01', 7),
      filme(11, 'Recente', '2012-05-01', 9),
      filme(12, 'Clássico', '1999-12-31', 8),
    ],
  };

  beforeEach(() => {
    descobrirFilmes.mockRejectedValue(new ApiError(404, 'Not found.'));
    buscarFilmes.mockResolvedValue(resultadosDaBusca);
  });

  it('cai para o modo de busca, avisa e desabilita gênero e duração', async () => {
    renderizar();

    expect(await screen.findByText('Pesquise um título')).toBeInTheDocument();
    expect(screen.getByText(/depende de uma rota do back-end/)).toBeInTheDocument();
    expect(screen.getByLabelText('Gênero')).toBeDisabled();
    expect(screen.getByLabelText('Duração')).toBeDisabled();
    expect(screen.getByLabelText('Década')).toBeEnabled();
    expect(
      within(screen.getByLabelText('Ordenar por')).getByRole('option', {
        name: 'Relevância',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(buscarFilmes).not.toHaveBeenCalled();
  });

  it('busca pelo título e mostra os resultados', async () => {
    renderizar();
    await screen.findByText('Pesquise um título');

    await userEvent.type(screen.getByLabelText('Título do filme'), 'filme');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('link', { name: 'Antigo (1995)' })).toBeInTheDocument();
    expect(buscarFilmes).toHaveBeenCalledWith({ q: 'filme', page: 1 });
  });

  it('filtra por década e ordena por nota sem nova consulta', async () => {
    renderizar('/filmes?q=filme');
    await screen.findByRole('link', { name: 'Antigo (1995)' });

    await userEvent.selectOptions(screen.getByLabelText('Década'), '1990s');
    await userEvent.selectOptions(screen.getByLabelText('Ordenar por'), 'Nota média');

    const nomes = within(screen.getByLabelText('Filmes'))
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label'));
    expect(nomes).toEqual(['Clássico (1999)', 'Antigo (1995)']);
    expect(buscarFilmes).toHaveBeenCalledTimes(1);
  });

  it('filtra pela nota mínima', async () => {
    renderizar('/filmes?q=filme&nota=8');

    expect(await screen.findByRole('link', { name: 'Recente (2012)' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Antigo (1995)' })).toBeNull();
  });

  it('mostra o estado vazio quando os filtros eliminam tudo', async () => {
    renderizar('/filmes?q=filme&decada=1960');

    expect(await screen.findByText('Nenhum filme encontrado')).toBeInTheDocument();
  });
});
