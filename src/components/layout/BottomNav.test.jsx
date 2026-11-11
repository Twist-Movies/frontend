import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';
import { BottomNav } from './BottomNav';

afterEach(() => vi.unstubAllEnvs());

describe('BottomNav', () => {
  it('expõe os destinos principais com ícone e rótulo', () => {
    renderWithRouter(<BottomNav />);

    const nav = screen.getByRole('navigation', { name: 'Navegação inferior' });
    expect(nav).toHaveClass('md:hidden', 'fixed', 'bottom-0');
    const destinos = {
      Início: '/',
      Filmes: '/filmes',
      Listas: '/listas',
      Membros: '/membros',
      Buscar: '/busca',
    };
    for (const [nome, href] of Object.entries(destinos)) {
      expect(screen.getByRole('link', { name: nome })).toHaveAttribute(
        'href',
        href,
      );
    }
    expect(nav.querySelectorAll('svg')).toHaveLength(5);
    expect(screen.queryByRole('link', { name: 'Séries' })).toBeNull();
  });

  it('marca a seção atual e só destaca Início na raiz', () => {
    renderWithRouter(<BottomNav />, { route: '/filmes' });

    expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('inclui Séries quando a funcionalidade está ligada', () => {
    vi.stubEnv('VITE_FEATURE_SERIES', 'true');
    renderWithRouter(<BottomNav />);

    expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute(
      'href',
      '/series',
    );
  });
});
