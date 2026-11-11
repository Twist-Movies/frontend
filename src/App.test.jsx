import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { clearAccessToken } from './api/tokens';
import { login } from './api/auth.mock';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
  });
  afterEach(() => vi.restoreAllMocks());

  it('manda o visitante para o login ao tentar a raiz', async () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Entrar' }),
    ).toBeInTheDocument();
  });

  it('mostra o carregamento (sem piscar o login) e entrega o feed a quem tem cookie de refresh', async () => {
    // Simula o cookie HttpOnly já existente (mock) e memória vazia, como após F5.
    await login({ identifier: 'davi', password: 'twist1234' });
    clearAccessToken();
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Entrar' }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText('Atividade de quem você segue'),
    ).toBeInTheDocument();
    expect(localStorage.getItem('twist:session')).toBeNull();
    expect(localStorage.getItem('twist:tokens')).toBeNull();
  });
});
