import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useParams } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import {
  criarPlaylist,
  listarPlaylists,
  listarPlaylistsOficiais,
} from '../api/playlists';
import Lists from './Lists';

vi.mock('../api/playlists', () => ({
  listarPlaylists: vi.fn(),
  listarPlaylistsOficiais: vi.fn(),
  criarPlaylist: vi.fn(),
  editarPlaylist: vi.fn(),
}));

function Destino() {
  const { listId } = useParams();
  return <p>detalhe da lista {listId}</p>;
}

function renderizar() {
  renderWithAuth(
    <Routes>
      <Route path="/listas" element={<Lists />} />
      <Route path="/lista/:listId" element={<Destino />} />
    </Routes>,
    { route: '/listas' },
  );
}

const PAGINA = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 7,
      name: 'Favoritos',
      description: 'Os melhores',
      is_public: false,
      cover_url: null,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  listarPlaylists.mockResolvedValue(PAGINA);
  listarPlaylistsOficiais.mockResolvedValue({ count: 0, results: [] });
});

describe('Lists', () => {
  it('lista as playlists do usuário', async () => {
    renderizar();

    const link = await screen.findByRole('link', { name: /Favoritos/ });
    expect(link).toHaveAttribute('href', '/lista/7');
    expect(screen.getByText('Os melhores')).toBeInTheDocument();
    expect(screen.getByText('Privada')).toBeInTheDocument();
  });

  it('mostra o estado vazio', async () => {
    listarPlaylists.mockResolvedValue({ ...PAGINA, count: 0, results: [] });
    renderizar();

    expect(
      await screen.findByText('Você ainda não criou nenhuma lista'),
    ).toBeInTheDocument();
  });

  it('exige um nome para criar a lista', async () => {
    renderizar();
    await screen.findByRole('link', { name: /Favoritos/ });

    await userEvent.click(screen.getByRole('button', { name: '+ Nova lista' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Dê um nome à lista.')).toBeInTheDocument();
    expect(criarPlaylist).not.toHaveBeenCalled();
  });

  it('cria a lista e abre o detalhe', async () => {
    criarPlaylist.mockResolvedValue({ id: 12 });
    renderizar();
    await screen.findByRole('link', { name: /Favoritos/ });

    await userEvent.click(screen.getByRole('button', { name: '+ Nova lista' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Terror');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('detalhe da lista 12')).toBeInTheDocument();
    expect(criarPlaylist).toHaveBeenCalledWith({
      name: 'Terror',
      description: '',
      isPublic: true,
      cover: null,
    });
  });

  it('convida a criar a primeira lista e abre o formulário', async () => {
    listarPlaylists.mockResolvedValue({ ...PAGINA, count: 0, results: [] });
    renderizar();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Criar minha primeira lista' }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('mostra as listas da equipe Twist mesmo sem listas próprias', async () => {
    listarPlaylists.mockResolvedValue({ ...PAGINA, count: 0, results: [] });
    listarPlaylistsOficiais.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 30,
          name: 'Clássicos Twist',
          description: 'Da equipe',
          is_public: true,
        },
      ],
    });
    renderizar();

    const secao = await screen.findByRole('region', {
      name: 'Listas da equipe Twist',
    });
    expect(
      within(secao).getByRole('link', { name: /Clássicos Twist/ }),
    ).toHaveAttribute('href', '/lista/30');
    expect(
      screen.getByText('Você ainda não criou nenhuma lista'),
    ).toBeInTheDocument();
  });

  it('oculta a seção da equipe quando a rota falha', async () => {
    listarPlaylistsOficiais.mockRejectedValue(new Error('falhou'));
    renderizar();

    await screen.findByRole('link', { name: /Favoritos/ });
    expect(
      screen.queryByRole('region', { name: 'Listas da equipe Twist' }),
    ).toBeNull();
  });
});
