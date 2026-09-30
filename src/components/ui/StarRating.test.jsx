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

    // 2 cheias + 1 metade + 2 vazias
    expect(container.querySelectorAll('[data-fill="half"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-fill="full"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-fill="empty"]')).toHaveLength(2);
  });
});

describe('StarRating (editável)', () => {
  it('expõe um radiogroup com dez opções — meias e cheias', () => {
    render(<StarRating value={0} onChange={vi.fn()} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });

  it('emite meia estrela ao clicar na zona esquerda', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '3.5 estrelas' }));

    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it('emite estrela cheia ao clicar na zona direita', async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '5 estrelas' }));

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('marca como selecionada apenas a opção correspondente à nota', () => {
    render(<StarRating value={4} onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: '4 estrelas' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: '4.5 estrelas' }),
    ).not.toBeChecked();
  });
});
