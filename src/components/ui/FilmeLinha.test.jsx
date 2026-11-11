import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';
import { FilmeLinha } from './FilmeLinha';

describe('FilmeLinha', () => {
  it('mostra capa, título, ano, nota e sinopse', () => {
    renderWithRouter(
      <FilmeLinha
        id={3}
        title="Heat"
        year={1995}
        posterUrl="/p.jpg"
        rating={4}
        overview="Um assaltante e um policial."
      />,
    );

    expect(screen.getByRole('link', { name: 'Heat (1995)' })).toHaveAttribute(
      'href',
      '/filme/3',
    );
    expect(screen.getByText('1995')).toBeInTheDocument();
    expect(
      screen.getByText('Um assaltante e um policial.'),
    ).toBeInTheDocument();
  });

  it('usa o título como capa e avisa quando não há sinopse', () => {
    renderWithRouter(<FilmeLinha id={4} title="Sem Capa" />);

    expect(
      document.querySelector('[data-slot="placeholder"]'),
    ).toHaveTextContent('Sem Capa');
    expect(screen.getByText('Sem sinopse disponível.')).toBeInTheDocument();
  });
});
