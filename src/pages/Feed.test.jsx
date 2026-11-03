import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import { listarPlaylists } from '../api/playlists';
import Feed from './Feed';

vi.mock('../api/playlists', () => ({ listarPlaylists: vi.fn() }));

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

beforeEach(() => {
  vi.clearAllMocks();
  listarPlaylists.mockResolvedValue({
    results: [{ id: 7, name: 'Favoritos', is_public: true }],
  });
});

describe('Feed', () => {
  it('cumprimenta o usuário logado', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Olá, Davi Almeida' }),
    ).toBeInTheDocument();
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

  it('mostra o erro da API', async () => {
    listarPlaylists.mockRejectedValue(new ApiError(500, 'Falha no servidor.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no servidor.');
  });

  it('leva a busca rápida para a tela de busca', async () => {
    renderizar();

    await userEvent.type(screen.getByLabelText('Buscar filme'), 'matrix');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByTestId('local')).toHaveTextContent('/busca?q=matrix');
  });

  it('não exibe filmes ou atividade de exemplo', () => {
    renderizar();

    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(screen.queryByLabelText('Populares esta semana')).toBeNull();
  });
});
