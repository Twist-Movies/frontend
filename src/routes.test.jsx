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
    ['/listas', 'Minhas listas'],
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
    ['/u/davi/filmes', 'Filmes assistidos'],
    ['/u/davi/diario', 'Diário'],
    ['/u/davi/watchlist', 'Watchlist'],
  ])('resolve a rota com parâmetro %s para a tela %s', (route, heading) => {
    renderAt(route);

    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it.each(['/filme/3', '/lista/1', '/resenha/1', '/u/davi'])(
    'resolve a rota dinâmica %s para uma tela que consulta a API',
    async (route) => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('off')));
      renderAt(route);

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText('Esta página não existe')).toBeNull();
      vi.unstubAllGlobals();
    },
  );

  it('mostra o feed na raiz', () => {
    renderAt('/');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Olá, Davi Almeida' }),
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
