import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza o conteúdo', () => {
    render(<Card>Conteúdo</Card>);

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('aplica a variante sem padding e repassa props do elemento', () => {
    render(
      <Card flush data-testid="card" aria-label="Cartão">
        x
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-flush');
    expect(card).toHaveAttribute('aria-label', 'Cartão');
  });
});
