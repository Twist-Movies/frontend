import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import { listarSeguidores, listarSeguindo, obterMeuPerfil } from '../api/users';
import Profile from './Profile';

vi.mock('../api/users', () => ({
  obterMeuPerfil: vi.fn(),
  listarSeguidores: vi.fn(),
  listarSeguindo: vi.fn(),
}));

const PERFIL = {
  id: 4,
  username: 'davi',
  email: 'davi@twist.app',
  first_name: 'Davi',
  last_name: 'Almeida',
  bio: 'Cinéfilo',
  avatar_url: null,
};

const pessoa = (id, username) => ({
  id,
  username,
  first_name: '',
  last_name: '',
  avatar_url: null,
});

function renderizar(route) {
  renderWithAuth(
    <Routes>
      <Route path="/u/:username" element={<Profile />} />
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  obterMeuPerfil.mockResolvedValue(PERFIL);
  listarSeguidores.mockResolvedValue({
    count: 21,
    results: [pessoa(5, 'ana')],
  });
  listarSeguindo.mockResolvedValue({ count: 0, results: [] });
});

describe('Profile', () => {
  it('mostra o próprio perfil com seguidores e quem segue', async () => {
    renderizar('/u/davi');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Davi Almeida' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cinéfilo')).toBeInTheDocument();
    expect(listarSeguidores).toHaveBeenCalledWith(4);
    expect(listarSeguindo).toHaveBeenCalledWith(4);

    expect(screen.getByRole('tab', { name: 'Seguidores (21)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ana/ })).toHaveAttribute('href', '/u/ana');
    expect(screen.getByText('Mostrando 1 de 21.')).toBeInTheDocument();
  });

  it('alterna para quem o usuário segue', async () => {
    renderizar('/u/davi');
    await screen.findByRole('heading', { level: 1, name: 'Davi Almeida' });

    await userEvent.click(screen.getByRole('tab', { name: 'Seguindo (0)' }));

    expect(screen.getByText('Ninguém por aqui ainda')).toBeInTheDocument();
  });

  it('compara o username sem diferenciar maiúsculas', async () => {
    renderizar('/u/DAVI');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Davi Almeida' }),
    ).toBeInTheDocument();
  });

  it('explica que perfis de outros membros ainda não existem', () => {
    renderizar('/u/ana');

    expect(screen.getByText('Perfil de @ana')).toBeInTheDocument();
    expect(obterMeuPerfil).not.toHaveBeenCalled();
  });

  it('mostra o erro da API', async () => {
    obterMeuPerfil.mockRejectedValue(new ApiError(500, 'Falha no servidor.'));
    renderizar('/u/davi');

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no servidor.');
  });
});
