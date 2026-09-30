import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithRouter } from '../test/utils';
import Landing from './Landing';
import { films, series } from '../data/mock';

describe('Landing', () => {
  it('apresenta a proposta do produto', () => {
    renderWithRouter(<Landing />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Descubra. Avalie. Compartilhe.',
      }),
    ).toBeInTheDocument();
  });

  it('leva ao cadastro e à vitrine de filmes', () => {
    renderWithRouter(<Landing />);

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
    expect(
      screen.getByRole('link', { name: 'Explorar filmes' }),
    ).toHaveAttribute('href', '#filmes');
  });

  it('mostra a vitrine de filmes ao visitante', () => {
    renderWithRouter(<Landing />);

    const vitrine = screen.getByLabelText('Filmes populares');
    expect(within(vitrine).getAllByRole('link')).toHaveLength(films.length);
    expect(
      within(vitrine).getByRole('link', { name: 'Bacurau (2019)' }),
    ).toHaveAttribute('href', '/filme/2');
  });

  it('não mostra séries enquanto a funcionalidade está em espera', () => {
    renderWithRouter(<Landing />);

    expect(screen.queryByLabelText('Séries populares')).not.toBeInTheDocument();
  });

  it('mostra a vitrine de séries quando a funcionalidade é ligada', () => {
    vi.stubEnv('VITE_FEATURE_SERIES', 'true');
    renderWithRouter(<Landing />);

    const vitrine = screen.getByLabelText('Séries populares');
    expect(within(vitrine).getAllByRole('link')).toHaveLength(series.length);
    expect(
      within(vitrine).getByRole('link', { name: 'Sintonia (2019)' }),
    ).toHaveAttribute('href', '/serie/2');
    vi.unstubAllEnvs();
  });

  it('rola até a seção pedida na âncora do endereço', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    renderWithRouter(<Landing />, { route: '/boas-vindas#sobre' });

    expect(scrollIntoView).toHaveBeenCalledOnce();
    delete Element.prototype.scrollIntoView;
  });
});
