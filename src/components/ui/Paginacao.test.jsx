import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Paginacao } from './Paginacao';

describe('Paginacao', () => {
  it('não aparece quando há uma página só', () => {
    render(
      <Paginacao pagina={1} temAnterior={false} temProxima={false} onChange={vi.fn()} />,
    );

    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('navega para a página anterior e a próxima', async () => {
    const onChange = vi.fn();
    render(
      <Paginacao pagina={2} temAnterior temProxima onChange={onChange} />,
    );

    expect(screen.getByText('Página 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(onChange.mock.calls).toEqual([[1], [3]]);
  });

  it('desabilita o botão sem página naquele sentido', () => {
    render(
      <Paginacao pagina={1} temAnterior={false} temProxima onChange={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeEnabled();
  });
});
