import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stub } from './Stub';

describe('Stub', () => {
  it('declara a sprint responsável e o que a tela terá', () => {
    render(
      <Stub
        title="Watchlist"
        sprint="Sprint 6 · Coleções"
        planned={['Grade de filmes marcados', 'Ordenação por data']}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Watchlist' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sprint 6 · Coleções')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Grade de filmes marcados')).toBeInTheDocument();
  });
});
