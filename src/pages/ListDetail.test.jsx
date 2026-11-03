import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import {
  editarPlaylist,
  excluirPlaylist,
  obterPlaylist,
  removerFilmeDaPlaylist,
} from '../api/playlists';
import ListDetail from './ListDetail';

vi.mock('../api/playlists', () => ({
  obterPlaylist: vi.fn(),
  editarPlaylist: vi.fn(),
  criarPlaylist: vi.fn(),
  excluirPlaylist: vi.fn(),
  removerFilmeDaPlaylist: vi.fn(),
}));

const LISTA = {
  id: 7,
  name: 'Favoritos',
  description: 'Os melhores',
  is_public: true,
  cover_url: null,
  owner_username: 'davi',
  movies_count: 1,
  movies: [
    {
      position: 0,
      added_at: '2026-10-20T10:00:00Z',
      movie: {
        id: 1,
        tmdb_id: 603,
        title: 'Matrix',
        original_title: 'The Matrix',
        poster_path: '/m.jpg',
        release_date: '1999-03-30',
      },
    },
  ],
};

function renderizar(sessao) {
  renderWithAuth(
    <Routes>
      <Route path="/lista/:listId" element={<ListDetail />} />
      <Route path="/listas" element={<p>minhas listas</p>} />
    </Routes>,
    { route: '/lista/7', ...(sessao ? { session: sessao } : {}) },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  obterPlaylist.mockResolvedValue(LISTA);
});

describe('ListDetail', () => {
  it('mostra a lista com seus filmes e os controles do dono', async () => {
    renderizar();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Favoritos' }),
    ).toBeInTheDocument();
    expect(obterPlaylist).toHaveBeenCalledWith('7');
    expect(screen.getByRole('link', { name: 'Matrix (1999)' })).toHaveAttribute(
      'href',
      '/filme/603',
    );
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('esconde os controles de quem não é o dono', async () => {
    renderizar({ username: 'outra', displayName: 'Outra' });

    await screen.findByRole('heading', { level: 1, name: 'Favoritos' });
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Remover/ })).toBeNull();
  });

  it('remove um filme da lista e recarrega', async () => {
    removerFilmeDaPlaylist.mockResolvedValue(null);
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Favoritos' });

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover Matrix da lista' }),
    );

    await waitFor(() => expect(obterPlaylist).toHaveBeenCalledTimes(2));
    expect(removerFilmeDaPlaylist).toHaveBeenCalledWith(7, 603);
  });

  it('exclui a lista depois de confirmar', async () => {
    excluirPlaylist.mockResolvedValue(null);
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Favoritos' });

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(await screen.findByText('minhas listas')).toBeInTheDocument();
    expect(excluirPlaylist).toHaveBeenCalledWith(7);
  });

  it('edita o nome da lista', async () => {
    editarPlaylist.mockResolvedValue({ ...LISTA, name: 'Top' });
    renderizar();
    await screen.findByRole('heading', { level: 1, name: 'Favoritos' });

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const nome = screen.getByLabelText('Nome');
    expect(nome).toHaveValue('Favoritos');
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Top');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(obterPlaylist).toHaveBeenCalledTimes(2));
    expect(editarPlaylist).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ name: 'Top', isPublic: true }),
    );
  });

  it('mostra o erro quando a lista não existe ou é privada', async () => {
    obterPlaylist.mockRejectedValue(new ApiError(404, 'Not found.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Not found.');
  });

  it('mostra o estado vazio', async () => {
    obterPlaylist.mockResolvedValue({ ...LISTA, movies: [], movies_count: 0 });
    renderizar();

    expect(
      await screen.findByText('Esta lista ainda está vazia'),
    ).toBeInTheDocument();
  });
});
