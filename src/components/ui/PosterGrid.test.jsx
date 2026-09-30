import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosterGrid } from './PosterGrid';

describe('PosterGrid', () => {
  it('renderiza os filhos e repassa props do elemento', () => {
    render(
      <PosterGrid aria-label="Populares">
        <span>Bacurau</span>
      </PosterGrid>,
    );

    const grade = screen.getByLabelText('Populares');
    expect(grade).toHaveAttribute('data-slot', 'poster-grid');
    expect(screen.getByText('Bacurau')).toBeInTheDocument();
  });
});
