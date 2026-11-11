import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import {
  buscarUsuarios,
  deixarDeSeguir,
  listarSeguidores,
  listarSeguindo,
  obterMeuPerfil,
  seguirUsuario,
} from '../api/users';
import Members from './Members';

vi.mock('../api/users', () => ({
  obterMeuPerfil: vi.fn(),
  listarSeguindo: vi.fn(),
  listarSeguidores: vi.fn(),
  seguirUsuario: vi.fn(),
  deixarDeSeguir: vi.fn(),
  buscarUsuarios: vi.fn(),
}));

const p = (id, username) => ({
  id,
  username,
  first_name: '',
  last_name: '',
  avatar_url: null,
});
const ana = p(5, 'ana');
const bia = p(6, 'bia');
const caio = p(7, 'caio');
const SESSAO = { id: 4, username: 'davi', displayName: 'Davi' };

function renderizar(session = SESSAO) {
  renderWithAuth(<Members />, { session });
}

beforeEach(() => {
  vi.clearAllMocks();
  obterMeuPerfil.mockResolvedValue({ id: 4, username: 'davi' });
  // Eu (4) sigo a ana; a ana segue o caio. Me seguem a bia e a ana.
  listarSeguindo.mockImplementation(async (id) => ({
    results: id === 4 ? [ana] : [caio],
    next: null,
  }));
  listarSeguidores.mockResolvedValue({ results: [bia, ana], next: null });
  seguirUsuario.mockResolvedValue(null);
  deixarDeSeguir.mockResolvedValue(null);
  buscarUsuarios.mockResolvedValue({ results: [], next: null });
});

describe('Members', () => {
  it('mostra quem o usuário segue, com contadores nas abas', async () => {
    renderizar();

    expect(await screen.findByText('@ana')).toBeInTheDocument();
    expect(listarSeguindo).toHaveBeenCalledWith(4, 1);
    expect(listarSeguidores).toHaveBeenCalledWith(4, 1);
    expect(
      screen.getByRole('tab', { name: 'Seguindo (1)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Seguidores (2)' }),
    ).toBeInTheDocument();
  });

  it('leva ao perfil de cada pessoa das abas', async () => {
    renderizar();

    expect(await screen.findByRole('link', { name: 'ana' })).toHaveAttribute(
      'href',
      '/u/ana',
    );

    await userEvent.click(screen.getByRole('tab', { name: /Seguidores/ }));

    expect(screen.getByRole('link', { name: 'bia' })).toHaveAttribute(
      'href',
      '/u/bia',
    );
  });

  it('descobre o id pela API quando a sessão guardada não tem', async () => {
    renderizar({ username: 'davi', displayName: 'Davi' });

    expect(await screen.findByText('@ana')).toBeInTheDocument();
    expect(obterMeuPerfil).toHaveBeenCalledOnce();
    expect(listarSeguindo).toHaveBeenCalledWith(4, 1);
  });

  it('mostra os seguidores e o estado de seguir de cada um', async () => {
    renderizar();
    await screen.findByText('@ana');

    await userEvent.click(screen.getByRole('tab', { name: /Seguidores/ }));

    expect(
      screen.getByRole('button', { name: 'Seguir bia' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Deixar de seguir ana' }),
    ).toBeInTheDocument();
  });

  it('segue um seguidor e atualiza a contagem', async () => {
    renderizar();
    await screen.findByText('@ana');
    await userEvent.click(screen.getByRole('tab', { name: /Seguidores/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Seguir bia' }));

    expect(
      await screen.findByRole('button', { name: 'Deixar de seguir bia' }),
    ).toBeInTheDocument();
    expect(seguirUsuario).toHaveBeenCalledWith(6);
    expect(
      screen.getByRole('tab', { name: 'Seguindo (2)' }),
    ).toBeInTheDocument();
  });

  it('deixa de seguir e mostra o estado vazio', async () => {
    renderizar();
    await screen.findByText('@ana');

    await userEvent.click(
      screen.getByRole('button', { name: 'Deixar de seguir ana' }),
    );

    expect(
      await screen.findByText('Você ainda não segue ninguém'),
    ).toBeInTheDocument();
    expect(deixarDeSeguir).toHaveBeenCalledWith(5);
    expect(
      screen.getByRole('tab', { name: 'Seguindo (0)' }),
    ).toBeInTheDocument();
  });

  it('mostra o erro da API ao seguir e não altera a lista', async () => {
    seguirUsuario.mockRejectedValue(
      new ApiError(400, 'Não foi possível seguir.'),
    );
    renderizar();
    await screen.findByText('@ana');
    await userEvent.click(screen.getByRole('tab', { name: /Seguidores/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Seguir bia' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível seguir.',
    );
    expect(
      screen.getByRole('tab', { name: 'Seguindo (1)' }),
    ).toBeInTheDocument();
  });

  it('sugere quem a rede segue e tira da lista quem foi seguido', async () => {
    renderizar();
    await screen.findByText('@ana');

    await userEvent.click(screen.getByRole('tab', { name: 'Sugestões' }));

    expect(await screen.findByText('@caio')).toBeInTheDocument();
    expect(screen.getByText('1 conexão em comum')).toBeInTheDocument();
    expect(listarSeguindo).toHaveBeenCalledWith(5);

    await userEvent.click(screen.getByRole('button', { name: 'Seguir caio' }));

    expect(
      await screen.findByText('Sem sugestões por enquanto'),
    ).toBeInTheDocument();
    expect(seguirUsuario).toHaveBeenCalledWith(7);
  });

  it('avisa quando não há sugestões', async () => {
    listarSeguindo.mockImplementation(async (id) => ({
      results: id === 4 ? [ana] : [],
      next: null,
    }));
    renderizar();
    await screen.findByText('@ana');

    await userEvent.click(screen.getByRole('tab', { name: 'Sugestões' }));

    expect(
      await screen.findByText('Sem sugestões por enquanto'),
    ).toBeInTheDocument();
  });

  it('mostra estados vazios quando a rede está vazia', async () => {
    listarSeguindo.mockResolvedValue({ results: [], next: null });
    listarSeguidores.mockResolvedValue({ results: [], next: null });
    renderizar();

    expect(
      await screen.findByText('Você ainda não segue ninguém'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Seguidores/ }));
    expect(screen.getByText('Ninguém segue você ainda')).toBeInTheDocument();
  });

  it('mostra o erro de carga e permite tentar de novo', async () => {
    listarSeguindo.mockRejectedValueOnce(
      new ApiError(500, 'Falha no servidor.'),
    );
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha no servidor.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(await screen.findByText('@ana')).toBeInTheDocument();
  });

  describe('busca de pessoas', () => {
    async function digitar(texto) {
      await screen.findByText('@ana');
      await userEvent.type(screen.getByLabelText('Buscar pessoas'), texto);
    }

    it('espera o debounce, consulta por username e esconde as abas', async () => {
      buscarUsuarios.mockResolvedValue({
        results: [bia, p(4, 'davi')],
        next: null,
      });
      renderizar();

      await digitar('bi');

      expect(buscarUsuarios).not.toHaveBeenCalled();
      expect(await screen.findByText('@bia')).toBeInTheDocument();
      expect(buscarUsuarios).toHaveBeenCalledTimes(1);
      expect(buscarUsuarios).toHaveBeenCalledWith('bi');
      // O próprio usuário não aparece nos resultados.
      expect(screen.queryByText('@davi')).toBeNull();
      expect(screen.queryByRole('tab')).toBeNull();
    });

    it('permite seguir alguém encontrado', async () => {
      buscarUsuarios.mockResolvedValue({ results: [bia], next: null });
      renderizar();
      await digitar('bia');

      await userEvent.click(
        await screen.findByRole('button', { name: 'Seguir bia' }),
      );

      expect(seguirUsuario).toHaveBeenCalledWith(6);
    });

    it('avisa quando ninguém é encontrado', async () => {
      renderizar();
      await digitar('zzz');

      expect(await screen.findByText('Ninguém encontrado')).toBeInTheDocument();
    });

    it('mostra o erro da busca', async () => {
      buscarUsuarios.mockRejectedValue(new ApiError(404, 'Rota ausente.'));
      renderizar();
      await digitar('bia');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Rota ausente.',
      );
    });

    it('volta às abas ao limpar o campo', async () => {
      renderizar();
      await digitar('bia');
      await userEvent.clear(screen.getByLabelText('Buscar pessoas'));

      expect(
        screen.getByRole('tab', { name: 'Seguindo (1)' }),
      ).toBeInTheDocument();
    });
  });
});
