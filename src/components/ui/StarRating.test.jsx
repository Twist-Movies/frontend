import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from './StarRating';

describe('StarRating (somente leitura)', () => {
  it('anuncia a nota como texto acessível', () => {
    render(<StarRating value={3.5} />);

    expect(
      screen.getByRole('img', { name: '3.5 de 5 estrelas' }),
    ).toBeInTheDocument();
  });

  it('anuncia ausência de nota quando o valor é zero', () => {
    render(<StarRating value={0} />);

    expect(screen.getByRole('img', { name: 'sem nota' })).toBeInTheDocument();
  });

  it('aceita um rótulo próprio', () => {
    render(<StarRating value={4} label="Nota média" />);

    expect(screen.getByRole('img', { name: 'Nota média' })).toBeInTheDocument();
  });

  it('não expõe controles quando não há onChange', () => {
    render(<StarRating value={4} />);

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('desenha a meia-estrela apenas na posição fracionada', () => {
    const { container } = render(<StarRating value={2.5} />);

    expect(container.querySelectorAll('[data-fill="half"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-fill="full"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-fill="empty"]')).toHaveLength(2);
  });
});

describe('StarRating (editável)', () => {
  it('expõe um radiogroup com dez notas em passos de meia estrela', () => {
    render(<StarRating value={0} onChange={vi.fn()} />);

    const rotulos = screen
      .getAllByRole('radio')
      .map((r) => r.getAttribute('aria-label'));
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(rotulos).toHaveLength(10);
    expect(rotulos.slice(0, 3)).toEqual([
      '0,5 estrela',
      '1 estrela',
      '1,5 estrelas',
    ]);
    expect(rotulos.at(-1)).toBe('5 estrelas');
  });

  it('emite meia estrela ao clicar na metade esquerda', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '3,5 estrelas' }));

    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it('muda a nota em 0,5 com as setas do teclado', async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    screen.getByRole('radio', { name: '3 estrelas' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(3.5);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it('respeita o limite de 5 e ignora outras teclas', async () => {
    const onChange = vi.fn();
    render(<StarRating value={5} onChange={onChange} />);

    screen.getByRole('radio', { name: '5 estrelas' }).focus();
    await userEvent.keyboard('{ArrowRight}a');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pré-visualiza a nota ao passar o mouse', async () => {
    const { container } = render(<StarRating value={0} onChange={vi.fn()} />);

    await userEvent.hover(screen.getByRole('radio', { name: '2,5 estrelas' }));
    expect(container.querySelectorAll('[data-fill="full"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-fill="half"]')).toHaveLength(1);
    await userEvent.unhover(screen.getByRole('radiogroup'));
    expect(container.querySelectorAll('[data-fill="full"]')).toHaveLength(0);
  });

  it('emite a nota inteira clicada', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '3 estrelas' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('marca só a nota atual e acende as estrelas até ela', () => {
    const { container } = render(<StarRating value={4} onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: '4 estrelas' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '5 estrelas' })).not.toBeChecked();
    expect(container.querySelectorAll('[data-fill="full"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-fill="half"]')).toHaveLength(0);
  });

  it('mostra meia estrela na nota fracionada', () => {
    const { container } = render(<StarRating value={4.5} onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: '4,5 estrelas' })).toBeChecked();
    expect(container.querySelectorAll('[data-fill="half"]')).toHaveLength(1);
  });
});
