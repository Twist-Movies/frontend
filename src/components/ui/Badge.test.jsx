import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renderiza o rótulo', () => {
    render(<Badge>Sprint 2</Badge>);

    expect(screen.getByText('Sprint 2')).not.toHaveAttribute('data-accent');
  });

  it('aplica o realce de acento', () => {
    render(<Badge accent>Novo</Badge>);

    expect(screen.getByText('Novo')).toHaveAttribute('data-accent');
  });
});
