import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';
import { ListaCard } from './ListaCard';

const lista = {
  id: 9,
  name: 'Clássicos',
  description: 'Para rever',
  is_public: true,
  cover_url: '/capa.jpg',
};

describe('ListaCard', () => {
  it('leva ao detalhe e mostra nome, descrição e visibilidade', () => {
    renderWithRouter(<ListaCard lista={lista} />);

    expect(screen.getByRole('link', { name: /Clássicos/ })).toHaveAttribute(
      'href',
      '/lista/9',
    );
    expect(screen.getByText('Para rever')).toBeInTheDocument();
    expect(screen.getByText('Pública')).toBeInTheDocument();
  });

  it('pode omitir a descrição', () => {
    renderWithRouter(
      <ListaCard
        lista={{ ...lista, is_public: false }}
        mostrarDescricao={false}
      />,
    );

    expect(screen.queryByText('Para rever')).toBeNull();
    expect(screen.getByText('Privada')).toBeInTheDocument();
  });
});
