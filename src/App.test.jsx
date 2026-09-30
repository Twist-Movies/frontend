import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manda o visitante para o login ao tentar a raiz', () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar' }),
    ).toBeInTheDocument();
  });

  it('entrega o feed a quem já tem sessão salva', () => {
    localStorage.setItem(
      'twist:tokens',
      JSON.stringify({ access: 'a', refresh: 'r' }),
    );
    localStorage.setItem(
      'twist:session',
      JSON.stringify({
        username: 'davi',
        displayName: 'Davi Almeida',
        email: 'davi@twist.app',
      }),
    );
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(
      screen.getByText('Atividade de quem você segue'),
    ).toBeInTheDocument();
  });
});
