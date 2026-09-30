import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithAuth } from './test/utils';
import { AppRoutes } from './routes';

function renderAt(route) {
  renderWithAuth(<AppRoutes />, { route });
}

describe('AppRoutes', () => {
  it.each([
    ['/filmes', 'Filmes'],
    ['/listas', 'Listas'],
    ['/membros', 'Membros'],
    ['/busca', 'Busca'],
    ['/configuracoes', 'Configurações'],
  ])('resolve %s para a tela %s', (route, heading) => {
    renderAt(route);

    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/filme/3', 'Filme'],
    ['/lista/l1', 'Lista'],
    ['/resenha/r1', 'Resenha'],
    ['/u/davi', 'Perfil'],
    ['/u/davi/filmes', 'Filmes assistidos'],
    ['/u/davi/diario', 'Diário'],
    ['/u/davi/watchlist', 'Watchlist'],
  ])('resolve a rota com parâmetro %s para a tela %s', (route, heading) => {
    renderAt(route);

    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it('mostra o feed na raiz', () => {
    renderAt('/');

    expect(
      screen.getByText('Atividade de quem você segue'),
    ).toBeInTheDocument();
  });

  it('cai no 404 para rota desconhecida', () => {
    renderAt('/nao-existe');

    expect(screen.getByText('Esta página não existe')).toBeInTheDocument();
  });

  it('envolve todas as telas no shell', () => {
    renderAt('/filmes');

    expect(screen.getByRole('link', { name: 'TWIST' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  describe('séries (em espera)', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('não tem rota de séries por padrão', () => {
      renderAt('/series');
      expect(screen.getByText('Esta página não existe')).toBeInTheDocument();
    });

    it.each([
      ['/series', 'Séries'],
      ['/serie/2', 'Série'],
    ])('com a funcionalidade ligada, resolve %s para %s', (route, heading) => {
      vi.stubEnv('VITE_FEATURE_SERIES', 'true');
      renderAt(route);
      expect(
        screen.getByRole('heading', { level: 1, name: heading }),
      ).toBeInTheDocument();
    });
  });
});
