import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionTitle } from './SectionTitle';

describe('SectionTitle', () => {
  it('renderiza o título e a ação', () => {
    render(
      <SectionTitle action={<a href="/filmes">ver tudo</a>}>
        Populares
      </SectionTitle>,
    );

    expect(screen.getByText('Populares')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ver tudo' })).toBeInTheDocument();
  });
});
