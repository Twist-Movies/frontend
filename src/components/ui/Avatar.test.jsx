import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('mostra as duas primeiras letras quando não há imagem', () => {
    render(<Avatar name="marina" />);

    expect(screen.getByTitle('marina')).toHaveTextContent('ma');
  });

  it('mostra a imagem quando há src', () => {
    const { container } = render(<Avatar name="davi" src="/avatar.png" />);

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/avatar.png',
    );
  });

  it('aplica o tamanho pedido', () => {
    render(<Avatar name="bia" size="lg" />);

    expect(screen.getByTitle('bia')).toHaveAttribute('data-size', 'lg');
  });
});
