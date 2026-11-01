import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../api/errors';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('mostra a mensagem do erro da API', () => {
    render(<ErrorState error={new ApiError(404, 'Filme não encontrado.')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Filme não encontrado.');
  });

  it('usa uma mensagem genérica sem erro', () => {
    render(<ErrorState />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
  });

  it('oferece tentar de novo só quando há onRetry', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorState onRetry={onRetry} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<ErrorState />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
