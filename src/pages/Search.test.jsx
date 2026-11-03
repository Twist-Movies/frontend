import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithRouter } from '../test/utils';
import { ApiError } from '../api/errors';
import { buscarFilmes } from '../api/movies';
import Search from './Search';

vi.mock('../api/movies', () => ({ buscarFilmes: vi.fn() }));

const RESPOSTA = {
  page: 1,
  total_pages: 3,
  total_results: 45,
  results: [
    {
      tmdb_id: 603,
      title: 'Matrix',
      release_date: '1999-03-30',
      poster_path: '/m.jpg',
      tmdb_rating_average: 8.2,
    },
  ],
};

function renderBusca(route) {
  renderWithRouter(
    <Routes>
      <Route path="/busca" element={<Search />} />
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  buscarFilmes.mockResolvedValue(RESPOSTA);
});

describe('Search', () => {
  it('convida a digitar quando não há termo', () => {
    renderBusca('/busca');

    expect(screen.getByText('O que você quer assistir?')).toBeInTheDocument();
    expect(buscarFilmes).not.toHaveBeenCalled();
  });

  it('busca o termo da URL e mostra os pôsteres', async () => {
    renderBusca('/busca?q=matrix');

    const card = await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(card).toHaveAttribute('href', '/filme/603');
    expect(buscarFilmes).toHaveBeenCalledWith({ q: 'matrix', page: 1 });
    expect(screen.getByText(/45 resultados/)).toBeInTheDocument();
  });

  it('avisa quando nada é encontrado', async () => {
    buscarFilmes.mockResolvedValue({ ...RESPOSTA, total_results: 0, results: [] });
    renderBusca('/busca?q=zzz');

    expect(await screen.findByText('Nada encontrado')).toBeInTheDocument();
  });

  it('mostra o erro da API', async () => {
    buscarFilmes.mockRejectedValue(new ApiError(503, 'TMDB indisponível.'));
    renderBusca('/busca?q=matrix');

    expect(await screen.findByRole('alert')).toHaveTextContent('TMDB indisponível.');
  });

  it('vai para a próxima página', async () => {
    renderBusca('/busca?q=matrix');
    await screen.findByRole('link', { name: 'Matrix (1999)' });

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(buscarFilmes).toHaveBeenLastCalledWith({ q: 'matrix', page: 2 });
  });

  it('busca um novo termo pelo formulário', async () => {
    renderBusca('/busca');

    await userEvent.type(screen.getByLabelText('Título do filme'), 'alien');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await screen.findByRole('link', { name: 'Matrix (1999)' });
    expect(buscarFilmes).toHaveBeenCalledWith({ q: 'alien', page: 1 });
  });
});
