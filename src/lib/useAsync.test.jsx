import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('começa carregando e entrega os dados', async () => {
    const carregar = vi.fn().mockResolvedValue({ a: 1 });
    const { result } = renderHook(() => useAsync(carregar, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ a: 1 });
    expect(result.current.error).toBeNull();
  });

  it('entrega o erro quando a carga falha', async () => {
    const falha = new Error('boom');
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(falha), []),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(falha);
    expect(result.current.data).toBeNull();
  });

  it('recarrega mantendo os dados antigos até os novos chegarem', async () => {
    const carregar = vi
      .fn()
      .mockResolvedValueOnce('antigo')
      .mockResolvedValueOnce('novo');
    const { result } = renderHook(() => useAsync(carregar, []));
    await waitFor(() => expect(result.current.data).toBe('antigo'));

    act(() => result.current.recarregar());

    expect(result.current.data).toBe('antigo');
    await waitFor(() => expect(result.current.data).toBe('novo'));
  });

  it('recarrega quando as dependências mudam', async () => {
    const carregar = vi.fn((id) => Promise.resolve(`filme ${id}`));
    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => carregar(id), [id]),
      { initialProps: { id: 1 } },
    );
    await waitFor(() => expect(result.current.data).toBe('filme 1'));

    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('filme 2'));
  });

  it('permite trocar os dados localmente', async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.resolve('a'), []),
    );
    await waitFor(() => expect(result.current.data).toBe('a'));

    act(() => result.current.definir('b'));
    expect(result.current.data).toBe('b');
  });
});
