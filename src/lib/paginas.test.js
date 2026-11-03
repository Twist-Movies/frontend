import { describe, expect, it, vi } from 'vitest';
import { todasAsPaginas } from './paginas';

describe('todasAsPaginas', () => {
  it('junta as páginas até não haver próxima', async () => {
    const carregar = vi
      .fn()
      .mockResolvedValueOnce({ results: [1, 2], next: 'x' })
      .mockResolvedValueOnce({ results: [3], next: null });

    await expect(todasAsPaginas(carregar)).resolves.toEqual([1, 2, 3]);
    expect(carregar.mock.calls).toEqual([[1], [2]]);
  });

  it('para numa página só quando não há próxima', async () => {
    const carregar = vi.fn().mockResolvedValue({ results: [1], next: null });

    await expect(todasAsPaginas(carregar)).resolves.toEqual([1]);
    expect(carregar).toHaveBeenCalledOnce();
  });

  it('respeita o limite de páginas', async () => {
    const carregar = vi.fn().mockResolvedValue({ results: [1], next: 'x' });

    const itens = await todasAsPaginas(carregar, { max: 3 });

    expect(carregar).toHaveBeenCalledTimes(3);
    expect(itens).toHaveLength(3);
  });

  it('repassa o erro de uma página', async () => {
    const carregar = vi.fn().mockRejectedValue(new Error('falhou'));

    await expect(todasAsPaginas(carregar)).rejects.toThrow('falhou');
  });
});
