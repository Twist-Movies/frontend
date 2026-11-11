import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';
import { PosterRow, PosterRowSkeleton } from './PosterRow';

describe('PosterRow', () => {
  it('lista os filmes da fileira com link para o detalhe', () => {
    renderWithRouter(
      <PosterRow
        title="Lançamentos"
        filmes={[
          { tmdb_id: 1, title: 'Matrix', release_date: '1999-03-30' },
          { tmdb_id: 2, title: 'Alien', release_date: '1979-05-25' },
        ]}
      />,
    );

    expect(
      screen.getByRole('region', { name: 'Lançamentos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Matrix (1999)' })).toHaveAttribute(
      'href',
      '/filme/1',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('mostra um esqueleto ocupado enquanto carrega', () => {
    renderWithRouter(<PosterRowSkeleton title="Em alta" />);

    expect(screen.getByRole('region', { name: 'Em alta' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
