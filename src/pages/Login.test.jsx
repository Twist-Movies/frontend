import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const identificador = () => screen.getByLabelText('E-mail ou nome de usuário');
const senha = () => screen.getByLabelText('Senha');
const enviar = () =>
  userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

async function preencher(id = 'davi@twist.app', pw = 'twist1234') {
  await userEvent.type(identificador(), id);
  await userEvent.type(senha(), pw);
}

describe('Login', () => {
  beforeEach(() => localStorage.clear());

  it('cobra os campos obrigatórios antes de chamar a API', async () => {
    montar();

    await enviar();

    expect(
      screen.getByText('Informe seu e-mail ou usuário.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  });

  it('limpa o erro do campo assim que o usuário corrige', async () => {
    montar();

    await enviar();
    await userEvent.type(identificador(), 'd');

    expect(
      screen.queryByText('Informe seu e-mail ou usuário.'),
    ).not.toBeInTheDocument();
  });

  it('entra com o nome de usuário, não só com o e-mail', async () => {
    montar();

    await preencher('davi');
    await enviar();

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/'),
    );
  });

  it('mostra credencial incorreta como erro de cliente, sem cara de falha do sistema', async () => {
    montar();

    await preencher('davi@twist.app', 'errada');
    await enviar();

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('E-mail, usuário ou senha incorretos.');
    expect(aviso).toHaveAttribute('data-tone', 'cliente');
  });

  it('desabilita o botão e avisa enquanto envia', async () => {
    montar();

    await preencher();
    await enviar();

    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  });

  it('devolve o usuário ao destino que ele tentou acessar', async () => {
    montar({
      pathname: '/entrar',
      state: { from: { pathname: '/u/davi/watchlist' } },
    });

    await preencher();
    await enviar();

    await waitFor(() =>
      expect(screen.getByTestId('rota')).toHaveTextContent('/u/davi/watchlist'),
    );
  });

  it('oferece o caminho para o cadastro', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
  });

  describe('dica da conta de demonstração', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('aparece no modo simulado', () => {
      montar();
      expect(screen.getByText(/Modo de demonstração/)).toBeInTheDocument();
    });

    it('some quando o front fala com a API real', () => {
      vi.stubEnv('VITE_API_MOCK', 'false');
      montar();
      expect(
        screen.queryByText(/Modo de demonstração/),
      ).not.toBeInTheDocument();
    });
  });
});
