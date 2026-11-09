import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import {
  deixarDeSeguir,
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
  seguirUsuario,
} from '../api/users';
import Profile from './Profile';

vi.mock('../api/users', () => ({
  obterMeuPerfil: vi.fn(),
  listarSeguidores: vi.fn(),
  listarSeguindo: vi.fn(),
  seguirUsuario: vi.fn(),
  deixarDeSeguir: vi.fn(),
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

const pessoa = (id, username, nome = '', sobrenome = '') => ({
  id,
  username,
  first_name: nome,
  last_name: sobrenome,
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
});

describe('Profile (próprio perfil)', () => {
  beforeEach(() => {
    listarSeguidores.mockResolvedValue({
      count: 21,
      results: [pessoa(5, 'ana')],
    });
    listarSeguindo.mockResolvedValue({ count: 0, results: [] });
  });

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

  it('mostra o erro da API', async () => {
    obterMeuPerfil.mockRejectedValue(new ApiError(500, 'Falha no servidor.'));
    renderizar('/u/davi');

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no servidor.');
  });
});

describe('Profile (perfil de outro membro)', () => {
  const ANA = pessoa(5, 'ana', 'Ana', 'Souza');
  const BIA = pessoa(6, 'bia');
  let meuSeguindo;
  let meusSeguidores;
  let seguidoresDaAna;

  const daNavegacao = (alvo = ANA) => ({
    pathname: `/u/${alvo.username}`,
    state: { pessoa: alvo },
  });

  beforeEach(() => {
    meuSeguindo = [];
    meusSeguidores = [];
    seguidoresDaAna = 3;
    listarSeguindo.mockImplementation(async (id) =>
      id === 4
        ? { count: meuSeguindo.length, results: meuSeguindo, next: null }
        : { count: 2, results: [], next: null },
    );
    listarSeguidores.mockImplementation(async (id) =>
      id === 4
        ? { count: meusSeguidores.length, results: meusSeguidores, next: null }
        : { count: seguidoresDaAna, results: [BIA], next: null },
    );
    seguirUsuario.mockImplementation(async () => {
      meuSeguindo = [ANA];
      seguidoresDaAna = 4;
    });
    deixarDeSeguir.mockImplementation(async () => {
      meuSeguindo = [];
      seguidoresDaAna = 2;
    });
  });

  it('mostra o perfil de quem veio de uma resenha, com contadores e botão de seguir', async () => {
    renderizar(daNavegacao());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ana Souza' }),
    ).toBeInTheDocument();
    expect(screen.getByText('@ana')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguir ana' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Seguidores (3)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Seguindo (2)' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Editar perfil' })).toBeNull();
    expect(listarSeguidores).toHaveBeenCalledWith(5);
  });

  it('oferece deixar de seguir quando o usuário já segue', async () => {
    meuSeguindo = [ANA];
    renderizar(daNavegacao());

    expect(
      await screen.findByRole('button', { name: 'Deixar de seguir ana' }),
    ).toBeInTheDocument();
  });

  it('segue a pessoa e atualiza o botão e a contagem', async () => {
    renderizar(daNavegacao());
    await userEvent.click(await screen.findByRole('button', { name: 'Seguir ana' }));

    expect(
      await screen.findByRole('button', { name: 'Deixar de seguir ana' }),
    ).toBeInTheDocument();
    expect(seguirUsuario).toHaveBeenCalledWith(5);
    expect(await screen.findByRole('tab', { name: 'Seguidores (4)' })).toBeInTheDocument();
  });

  it('deixa de seguir a pessoa', async () => {
    meuSeguindo = [ANA];
    seguidoresDaAna = 3;
    renderizar(daNavegacao());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Deixar de seguir ana' }),
    );

    expect(await screen.findByRole('button', { name: 'Seguir ana' })).toBeInTheDocument();
    expect(deixarDeSeguir).toHaveBeenCalledWith(5);
    expect(await screen.findByRole('tab', { name: 'Seguidores (2)' })).toBeInTheDocument();
  });

  it('mostra o erro da API e mantém o botão como estava', async () => {
    seguirUsuario.mockRejectedValue(new ApiError(400, 'Você já segue este usuário.'));
    renderizar(daNavegacao());

    await userEvent.click(await screen.findByRole('button', { name: 'Seguir ana' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Você já segue');
    expect(screen.getByRole('button', { name: 'Seguir ana' })).toBeEnabled();
  });

  it('abre um link direto quando a pessoa está na rede do usuário', async () => {
    meusSeguidores = [ANA];
    renderizar('/u/ANA');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ana Souza' }),
    ).toBeInTheDocument();
  });

  it('ignora dados de navegação de outra pessoa', async () => {
    meusSeguidores = [ANA];
    renderizar({ pathname: '/u/ana', state: { pessoa: BIA } });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ana Souza' }),
    ).toBeInTheDocument();
  });

  it('explica quando o perfil não pode ser aberto', async () => {
    renderizar('/u/zeca');

    expect(await screen.findByText('Perfil de @zeca')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver membros' })).toHaveAttribute(
      'href',
      '/membros',
    );
    expect(screen.queryByRole('button', { name: /Seguir/ })).toBeNull();
  });

  it('liga as conexões da pessoa aos perfis delas', async () => {
    renderizar(daNavegacao());
    await screen.findByRole('heading', { level: 1, name: 'Ana Souza' });

    expect(screen.getByRole('link', { name: /bia/ })).toHaveAttribute('href', '/u/bia');
  });

  it('mostra o erro de carga', async () => {
    listarSeguindo.mockRejectedValue(new ApiError(500, 'Falha no servidor.'));
    renderizar(daNavegacao());

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no servidor.');
  });
});
