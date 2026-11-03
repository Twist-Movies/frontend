import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/utils';
import { PosterCard } from './PosterCard';

describe('PosterCard', () => {
  it('aponta para a página do filme', () => {
    renderWithRouter(<PosterCard id="7" title="Bacurau" year={2019} />);

    expect(
      screen.getByRole('link', { name: 'Bacurau (2019)' }),
    ).toHaveAttribute('href', '/filme/7');
  });

  it('mostra título, ano e nota', () => {
    renderWithRouter(
      <PosterCard id="1" title="Bacurau" year={2019} rating={4} />,
    );

    expect(screen.getByText('2019')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '4 de 5 estrelas' }),
    ).toBeInTheDocument();
  });

  it('omite os metadados no modo compacto', () => {
    renderWithRouter(<PosterCard id="1" title="Bacurau" year={2019} compact />);

    expect(screen.queryByText('2019')).not.toBeInTheDocument();
  });

  it('usa o título como placeholder enquanto não há pôster', () => {
    const { container } = renderWithRouter(
      <PosterCard id="1" title="Bacurau" />,
    );

    expect(container.querySelector('[data-slot="placeholder"]')).toHaveTextContent(
      'Bacurau',
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('renderiza a imagem quando há pôster', () => {
    const { container } = renderWithRouter(
      <PosterCard id="1" title="Bacurau" posterUrl="/p.jpg" />,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', '/p.jpg');
  });

  it('aponta para a página da série quando kind é serie', () => {
    renderWithRouter(
      <PosterCard id="3" title="Cidade dos Homens" year={2002} kind="serie" />,
    );

    expect(
      screen.getByRole('link', { name: 'Cidade dos Homens (2002)' }),
    ).toHaveAttribute('href', '/serie/3');
  });
});
