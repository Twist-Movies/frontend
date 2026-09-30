import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../auth';
import Signup from './Signup';

function Sonda() {
  return <span data-testid="rota">{useLocation().pathname}</span>;
}

function montar() {
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <AuthProvider sessaoInicial={null}>
        <Routes>
          <Route path="/cadastro" element={<Signup />} />
          <Route path="*" element={<Sonda />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const botao = () => screen.getByRole('button', { name: /Criar conta/ });
const aceitarTermos = () => userEvent.click(screen.getByRole('checkbox'));

describe('Signup', () => {
  beforeEach(() => localStorage.clear());

  it('só libera o envio depois do aceite dos termos', async () => {
    montar();

    expect(botao()).toBeDisabled();

    await aceitarTermos();

    expect(botao()).toBeEnabled();
  });

  it('cobra os três campos', async () => {
    montar();
    await aceitarTermos();

    await userEvent.click(botao());

    expect(screen.getByText('Escolha um nome de usuário.')).toBeInTheDocument();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Escolha uma senha.')).toBeInTheDocument();
  });

  it('recusa usuário curto e com caracteres inválidos', async () => {
    montar();
    await aceitarTermos();

    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'ab');
    await userEvent.click(botao());
    expect(screen.getByText('Mínimo de 3 caracteres.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'c d!');
    await userEvent.click(botao());
    expect(
      screen.getByText('Use apenas letras, números e underscore.'),
    ).toBeInTheDocument();
  });

  it('exige senha de oito caracteres', async () => {
    montar();
    await aceitarTermos();

    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'novato');
    await userEvent.type(screen.getByLabelText('E-mail'), 'novato@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'curta');
    await userEvent.click(botao());

    expect(screen.getByText('Mínimo de 8 caracteres.')).toBeInTheDocument();
  });

  it('mostra a força da senha apenas depois de começar a digitar', async () => {
    montar();

    expect(screen.queryByText(/Força da senha/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Senha'), 'abcdef123456!');

    expect(screen.getByText('Força da senha: Forte')).toBeInTheDocument();
  });

  it('avisa que o nome de usuário já está em uso', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'davi');

    expect(
      await screen.findByText('Este nome já está em uso.'),
    ).toBeInTheDocument();
  });

  it('confirma quando o nome está livre', async () => {
    montar();

    await userEvent.type(
      screen.getByLabelText('Nome de usuário'),
      'nome_bem_livre',
    );

    expect(await screen.findByText('Nome disponível.')).toBeInTheDocument();
  });

  it('não consulta disponibilidade com menos de três caracteres', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'ab');

    await waitFor(() => {
      expect(screen.queryByText('Nome disponível.')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Este nome já está em uso.'),
      ).not.toBeInTheDocument();
    });
  });

  it('cria a conta e entra direto na aplicação', async () => {
    const sufixo = Math.random().toString(36).slice(2, 8);
    montar();
    await aceitarTermos();

    await userEvent.type(
      screen.getByLabelText('Nome de usuário'),
      `tela_${sufixo}`,
    );
    await userEvent.type(
      screen.getByLabelText('E-mail'),
      `tela_${sufixo}@twist.app`,
    );
    await userEvent.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await userEvent.click(botao());

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/'),
    );
  });

  it('mostra o conflito de e-mail vindo da API como erro de cliente', async () => {
    montar();
    await aceitarTermos();

    await userEvent.type(
      screen.getByLabelText('Nome de usuário'),
      `outro_${Math.random().toString(36).slice(2, 8)}`,
    );
    await userEvent.type(screen.getByLabelText('E-mail'), 'davi@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await userEvent.click(botao());

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('Já existe uma conta com este e-mail.');
    expect(aviso).toHaveAttribute('data-tone', 'cliente');
  });

  it('oferece o caminho de volta para o login', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/entrar',
    );
  });
});
