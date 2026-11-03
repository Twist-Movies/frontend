import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('mostra apenas o título quando não há mais nada', () => {
    render(<EmptyState title="Nada por aqui" />);

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
  });

  it('mostra descrição e ação quando fornecidas', () => {
    render(
      <EmptyState
        title="Watchlist vazia"
        description="Adicione filmes que você quer ver."
        action={<button>Explorar</button>}
      />,
    );

    expect(
      screen.getByText('Adicione filmes que você quer ver.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Explorar' }),
    ).toBeInTheDocument();
  });
});
