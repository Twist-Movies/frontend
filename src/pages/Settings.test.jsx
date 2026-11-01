import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuth } from '../test/utils';
import { ApiError } from '../api/errors';
import {
  editarMeuPerfil,
  excluirMinhaConta,
  obterMeuPerfil,
} from '../api/users';
import { useAuth } from '../auth';
import Settings from './Settings';

vi.mock('../api/users', () => ({
  obterMeuPerfil: vi.fn(),
  editarMeuPerfil: vi.fn(),
  excluirMinhaConta: vi.fn(),
}));

const PERFIL = {
  id: 4,
  username: 'davi',
  email: 'davi@twist.app',
  first_name: 'Davi',
  last_name: 'Almeida',
  birth_date: '2000-05-10',
  bio: 'Cinéfilo',
  avatar_url: null,
};

function SessaoAtual() {
  const { session, status } = useAuth();
  return (
    <p data-testid="sessao">
      {status}:{session?.displayName}
    </p>
  );
}

function renderizar() {
  renderWithAuth(
    <>
      <Settings />
      <SessaoAtual />
    </>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  obterMeuPerfil.mockResolvedValue(PERFIL);
});

describe('Settings', () => {
  it('preenche o formulário com o perfil atual', async () => {
    renderizar();

    expect(await screen.findByLabelText('Nome')).toHaveValue('Davi');
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Almeida');
    expect(screen.getByLabelText('Nome de usuário')).toHaveValue('davi');
    expect(screen.getByLabelText('E-mail')).toHaveValue('davi@twist.app');
    expect(screen.getByLabelText('Data de nascimento')).toHaveValue('2000-05-10');
    expect(screen.getByLabelText('Bio')).toHaveValue('Cinéfilo');
  });

  it('salva as alterações e atualiza a sessão', async () => {
    editarMeuPerfil.mockResolvedValue({ ...PERFIL, first_name: 'David' });
    renderizar();

    const nome = await screen.findByLabelText('Nome');
    await userEvent.clear(nome);
    await userEvent.type(nome, 'David');
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(await screen.findByText('Perfil atualizado.')).toBeInTheDocument();
    expect(editarMeuPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'David', username: 'davi' }),
    );
    expect(screen.getByTestId('sessao')).toHaveTextContent('autenticado:David Almeida');
  });

  it('exige usuário e e-mail', async () => {
    renderizar();

    const usuario = await screen.findByLabelText('Nome de usuário');
    await userEvent.clear(usuario);
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(await screen.findByText('Escolha um nome de usuário.')).toBeInTheDocument();
    expect(editarMeuPerfil).not.toHaveBeenCalled();
  });

  it('mostra no campo o erro devolvido pela API', async () => {
    editarMeuPerfil.mockRejectedValue(
      new ApiError(400, 'Confira os campos destacados.', {
        email: 'Já existe uma conta com este e-mail.',
      }),
    );
    renderizar();
    await screen.findByLabelText('Nome');

    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(
      await screen.findByText('Já existe uma conta com este e-mail.'),
    ).toBeInTheDocument();
  });

  it('só exclui a conta depois de digitar o username', async () => {
    excluirMinhaConta.mockResolvedValue(null);
    renderizar();
    await screen.findByLabelText('Nome');

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' }),
    );
    const confirmar = screen.getByRole('button', {
      name: 'Excluir definitivamente',
    });
    expect(confirmar).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Digite davi para confirmar'), 'davi');
    expect(confirmar).toBeEnabled();
    await userEvent.click(confirmar);

    await waitFor(() => expect(excluirMinhaConta).toHaveBeenCalledWith('davi'));
    await waitFor(() =>
      expect(screen.getByTestId('sessao')).toHaveTextContent('visitante'),
    );
  });

  it('mostra o erro quando a exclusão falha', async () => {
    excluirMinhaConta.mockRejectedValue(new ApiError(400, 'Username não confere.'));
    renderizar();
    await screen.findByLabelText('Nome');

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' }),
    );
    await userEvent.type(screen.getByLabelText('Digite davi para confirmar'), 'davi');
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Username não confere.');
  });

  it('mostra erro se o perfil não carrega', async () => {
    obterMeuPerfil.mockRejectedValue(new ApiError(500, 'Falha.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha.');
  });
});
