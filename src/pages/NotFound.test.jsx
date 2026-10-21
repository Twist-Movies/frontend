import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/utils';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('explica o erro e oferece a volta para o início', () => {
    renderWithRouter(<NotFound />);

    expect(screen.getByText('Esta página não existe')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/');
  });
});
