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

  it('limita a 6 colunas, com 3 no mobile', () => {
    render(<PosterGrid aria-label="Grade" className="extra" />);

    const grade = screen.getByLabelText('Grade');
    expect(grade).toHaveClass(
      'grid-cols-3',
      'sm:grid-cols-4',
      'md:grid-cols-5',
      'lg:grid-cols-6',
      'extra',
    );
    expect(grade.className).not.toMatch(/(?:xl|2xl):grid-cols|auto-fill/);
  });
});
