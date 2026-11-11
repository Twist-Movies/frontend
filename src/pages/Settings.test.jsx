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
    expect(screen.getByLabelText('Data de nascimento')).toHaveValue(
      '10/05/2000',
    );
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
    expect(screen.getByTestId('sessao')).toHaveTextContent(
      'autenticado:David Almeida',
    );
  });

  it('envia a data de nascimento em ISO e valida a máscara', async () => {
    editarMeuPerfil.mockResolvedValue(PERFIL);
    renderizar();

    const data = await screen.findByLabelText('Data de nascimento');
    await userEvent.clear(data);
    await userEvent.type(data, '31022000');
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );
    expect(await screen.findByText(/data válida/)).toBeInTheDocument();
    expect(editarMeuPerfil).not.toHaveBeenCalled();

    await userEvent.clear(data);
    await userEvent.type(data, '15062000');
    expect(data).toHaveValue('15/06/2000');
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );
    await screen.findByText('Perfil atualizado.');
    expect(editarMeuPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ birthDate: '2000-06-15' }),
    );
  });

  it('exige usuário e e-mail', async () => {
    renderizar();

    const usuario = await screen.findByLabelText('Nome de usuário');
    await userEvent.clear(usuario);
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(
      await screen.findByText('Escolha um nome de usuário.'),
    ).toBeInTheDocument();
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

  it('só exclui a conta com username (sem diferenciar caixa) e senha', async () => {
    excluirMinhaConta.mockResolvedValue(null);
    renderizar();
    await screen.findByLabelText('Nome');

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' }),
    );
    expect(screen.getByLabelText('Senha atual')).toHaveAttribute(
      'type',
      'password',
    );
    const confirmar = screen.getByRole('button', {
      name: 'Excluir definitivamente',
    });
    expect(confirmar).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText('Confirme seu nome de usuário'),
      'DAVI',
    );
    await userEvent.type(screen.getByLabelText('Senha atual'), 'segredo123');
    expect(confirmar).toBeEnabled();
    await userEvent.click(confirmar);

    await waitFor(() =>
      expect(excluirMinhaConta).toHaveBeenCalledWith({
        username: 'davi',
        password: 'segredo123',
      }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('sessao')).toHaveTextContent('visitante'),
    );
  });

  it('mostra o erro quando a exclusão falha', async () => {
    excluirMinhaConta.mockRejectedValue(
      new ApiError(400, 'Username não confere.'),
    );
    renderizar();
    await screen.findByLabelText('Nome');

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' }),
    );
    await userEvent.type(
      screen.getByLabelText('Confirme seu nome de usuário'),
      'DAVI',
    );
    await userEvent.type(screen.getByLabelText('Senha atual'), 'segredo123');
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Username não confere.',
    );
  });

  it('mostra erro se o perfil não carrega', async () => {
    obterMeuPerfil.mockRejectedValue(new ApiError(500, 'Falha.'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha.');
  });

  it('erro de senha na exclusão aparece no modal', async () => {
    excluirMinhaConta.mockRejectedValue(
      new ApiError(400, 'Confira os campos destacados.', {
        password: 'Senha incorreta.',
      }),
    );
    renderizar();
    await screen.findByLabelText('Nome');
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' }),
    );
    await userEvent.type(
      screen.getByLabelText('Confirme seu nome de usuário'),
      'davi',
    );
    await userEvent.type(screen.getByLabelText('Senha atual'), 'errada');
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(await screen.findByText('Senha incorreta.')).toBeInTheDocument();
    expect(screen.getByTestId('sessao')).toHaveTextContent('autenticado');
  });

  describe('troca de e-mail', () => {
    it('só mostra "Senha atual" quando o e-mail difere do atual', async () => {
      renderizar();
      const email = await screen.findByLabelText('E-mail');
      expect(screen.queryByLabelText('Senha atual')).not.toBeInTheDocument();

      await userEvent.clear(email);
      await userEvent.type(email, 'novo@twist.app');
      const senha = screen.getByLabelText('Senha atual');
      expect(senha).toHaveAttribute('type', 'password');
      expect(senha).toHaveAttribute('autocomplete', 'current-password');

      await userEvent.clear(email);
      await userEvent.type(email, 'DAVI@twist.app');
      expect(screen.queryByLabelText('Senha atual')).not.toBeInTheDocument();
    });

    it('exige a senha atual no formulário ao trocar o e-mail', async () => {
      renderizar();
      const email = await screen.findByLabelText('E-mail');
      await userEvent.clear(email);
      await userEvent.type(email, 'novo@twist.app');
      await userEvent.click(
        screen.getByRole('button', { name: 'Salvar alterações' }),
      );

      expect(
        await screen.findByText(/Informe sua senha atual/),
      ).toBeInTheDocument();
      expect(editarMeuPerfil).not.toHaveBeenCalled();
    });

    it('com senha certa envia current_password e encerra a sessão', async () => {
      editarMeuPerfil.mockResolvedValue({ ...PERFIL, email: 'novo@twist.app' });
      renderizar();
      const email = await screen.findByLabelText('E-mail');
      await userEvent.clear(email);
      await userEvent.type(email, 'novo@twist.app');
      await userEvent.type(screen.getByLabelText('Senha atual'), 'segredo123');
      await userEvent.click(
        screen.getByRole('button', { name: 'Salvar alterações' }),
      );

      await waitFor(() =>
        expect(editarMeuPerfil).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'novo@twist.app',
            currentPassword: 'segredo123',
          }),
        ),
      );
      await waitFor(() =>
        expect(screen.getByTestId('sessao')).toHaveTextContent('visitante'),
      );
    });

    it('sem trocar o e-mail não envia senha', async () => {
      editarMeuPerfil.mockResolvedValue(PERFIL);
      renderizar();
      await screen.findByLabelText('Nome');
      await userEvent.click(
        screen.getByRole('button', { name: 'Salvar alterações' }),
      );
      await screen.findByText('Perfil atualizado.');
      expect(editarMeuPerfil.mock.calls[0][0].currentPassword).toBeUndefined();
    });

    it('erro de senha atual vindo da API aparece no campo e mantém a sessão', async () => {
      editarMeuPerfil.mockRejectedValue(
        new ApiError(400, 'Confira os campos destacados.', {
          current_password: 'Senha atual incorreta.',
        }),
      );
      renderizar();
      const email = await screen.findByLabelText('E-mail');
      await userEvent.clear(email);
      await userEvent.type(email, 'novo@twist.app');
      await userEvent.type(screen.getByLabelText('Senha atual'), 'errada');
      await userEvent.click(
        screen.getByRole('button', { name: 'Salvar alterações' }),
      );

      expect(
        await screen.findByText('Senha atual incorreta.'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('sessao')).toHaveTextContent('autenticado');
    });
  });
});
