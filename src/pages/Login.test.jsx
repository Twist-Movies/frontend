import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../auth';
import Login from './Login';

function Sonda() {
  return <span data-testid="rota">{useLocation().pathname}</span>;
}

function montar(entrada = { pathname: '/entrar' }) {
  render(
    <MemoryRouter initialEntries={[entrada]}>
      <AuthProvider sessaoInicial={null}>
        <Routes>
          <Route path="/entrar" element={<Login />} />
          <Route path="*" element={<Sonda />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const enviar = () =>
  userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

describe('Login', () => {
  beforeEach(() => localStorage.clear());

  it('cobra os campos obrigatórios antes de chamar a API', async () => {
    montar();

    await enviar();

    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  });

  it('recusa e-mail malformado', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'davi-arroba-twist');
    await userEvent.type(screen.getByLabelText('Senha'), 'twist1234');
    await enviar();

    expect(screen.getByText('E-mail inválido.')).toBeInTheDocument();
  });

  it('limpa o erro do campo assim que o usuário corrige', async () => {
    montar();

    await enviar();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('E-mail'), 'd');

    expect(screen.queryByText('Informe seu e-mail.')).not.toBeInTheDocument();
  });

  it('mostra credencial incorreta como erro de cliente, sem cara de falha do sistema', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'davi@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await enviar();

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('E-mail ou senha incorretos.');
    expect(aviso).toHaveAttribute('data-tone', 'cliente');
    expect(aviso).not.toHaveAttribute('data-tone', 'servidor');
  });

  it('desabilita o botão e avisa enquanto envia', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'davi@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'twist1234');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    const botao = screen.getByRole('button', { name: 'Entrando…' });
    expect(botao).toBeDisabled();
  });

  it('leva para a raiz quando não havia destino guardado', async () => {
    montar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'davi@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'twist1234');
    await enviar();

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/'),
    );
  });

  it('devolve o usuário ao destino que ele tentou acessar', async () => {
    montar({
      pathname: '/entrar',
      state: { from: { pathname: '/u/davi/diario' } },
    });

    await userEvent.type(screen.getByLabelText('E-mail'), 'davi@twist.app');
    await userEvent.type(screen.getByLabelText('Senha'), 'twist1234');
    await enviar();

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/u/davi/diario'),
    );
  });

  it('oferece o caminho para o cadastro', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
  });
});
