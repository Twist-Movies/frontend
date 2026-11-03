import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza o conteúdo e dispara o clique', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Registrar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('não dispara clique quando desabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Salvar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica variante, tamanho e largura total', () => {
    render(
      <Button variant="primary" size="sm" block>
        Ok
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-block');
  });

  it('usa a variante e o tamanho padrão', () => {
    render(<Button>Ok</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).not.toHaveAttribute('data-block');
  });
});
