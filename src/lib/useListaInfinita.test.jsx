import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { useListaInfinita } from './useListaInfinita';

const pagina = (n, total = 3) => ({
  results: [{ id: `${n}a` }, { id: `${n}b` }],
  total_pages: total,
});

afterEach(() => vi.unstubAllGlobals());

describe('useListaInfinita', () => {
  it('carrega a primeira página e acumula as seguintes', async () => {
    const carregar = vi.fn(async (n) => pagina(n));
    const { result } = renderHook(() => useListaInfinita(carregar, []));

    expect(result.current.primeiraCarga).toBe(true);
    await waitFor(() => expect(result.current.itens).toHaveLength(2));
    expect(result.current.temMais).toBe(true);

    await act(async () => result.current.carregarMais());
    await waitFor(() => expect(result.current.itens).toHaveLength(4));
    expect(carregar.mock.calls).toEqual([[1], [2]]);
  });

  it('para na última página', async () => {
    const carregar = vi.fn(async (n) => pagina(n, 2));
    const { result } = renderHook(() => useListaInfinita(carregar, []));
    await waitFor(() => expect(result.current.itens).toHaveLength(2));

    await act(async () => result.current.carregarMais());
    await waitFor(() => expect(result.current.itens).toHaveLength(4));

    expect(result.current.temMais).toBe(false);
    await act(async () => result.current.carregarMais());
    expect(carregar).toHaveBeenCalledTimes(2);
  });

  it('não pede duas páginas ao mesmo tempo', async () => {
    let liberar;
    const carregar = vi.fn((n) =>
      n === 1
        ? Promise.resolve(pagina(1))
        : new Promise((resolve) => {
            liberar = () => resolve(pagina(n));
          }),
    );
    const { result } = renderHook(() => useListaInfinita(carregar, []));
    await waitFor(() => expect(result.current.itens).toHaveLength(2));

    act(() => {
      result.current.carregarMais();
      result.current.carregarMais();
    });

    expect(carregar).toHaveBeenCalledTimes(2);
    await act(async () => liberar());
  });

  it('recomeça do zero quando as dependências mudam', async () => {
    const carregar = vi.fn(async (n) => ({
      results: [{ id: `${n}` }],
      total_pages: 1,
    }));
    const { result, rerender } = renderHook(
      ({ chave }) => useListaInfinita(carregar, [chave]),
      { initialProps: { chave: 'a' } },
    );
    await waitFor(() => expect(result.current.itens).toHaveLength(1));

    rerender({ chave: 'b' });

    await waitFor(() => expect(carregar).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.itens).toHaveLength(1));
    expect(carregar.mock.calls).toEqual([[1], [1]]);
  });

  it('ignora a resposta de uma consulta que já foi substituída', async () => {
    const respostas = {};
    const carregar = vi.fn(
      (n, chave) =>
        new Promise((resolve) => {
          respostas[chave] = () =>
            resolve({ results: [{ id: chave }], total_pages: 1 });
        }),
    );
    const { result, rerender } = renderHook(
      ({ chave }) => useListaInfinita((n) => carregar(n, chave), [chave]),
      { initialProps: { chave: 'velha' } },
    );
    rerender({ chave: 'nova' });
    await waitFor(() => expect(respostas.nova).toBeDefined());

    await act(async () => {
      respostas.nova();
      respostas.velha();
    });

    expect(result.current.itens).toEqual([{ id: 'nova' }]);
  });

  it('guarda o erro, mantém os itens e permite repetir', async () => {
    const carregar = vi
      .fn()
      .mockResolvedValueOnce(pagina(1))
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValueOnce(pagina(2));
    const { result } = renderHook(() => useListaInfinita(carregar, []));
    await waitFor(() => expect(result.current.itens).toHaveLength(2));

    await act(async () => result.current.carregarMais());
    await waitFor(() => expect(result.current.erro).toBeTruthy());
    expect(result.current.itens).toHaveLength(2);

    await act(async () => result.current.repetir());
    await waitFor(() => expect(result.current.itens).toHaveLength(4));
    expect(result.current.erro).toBeNull();
    expect(carregar.mock.calls.at(-1)).toEqual([2]);
  });

  it('guarda o erro da primeira página e repete a primeira página', async () => {
    const carregar = vi
      .fn()
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValueOnce(pagina(1));
    const { result } = renderHook(() => useListaInfinita(carregar, []));
    await waitFor(() => expect(result.current.erro).toBeTruthy());

    await act(async () => result.current.repetir());

    await waitFor(() => expect(result.current.itens).toHaveLength(2));
    expect(carregar.mock.calls.at(-1)).toEqual([1]);
  });

  it('carrega a próxima página quando o fim da lista aparece na tela', async () => {
    const observadores = [];
    class FalsoObservador {
      constructor(aoMudar) {
        this.aoMudar = aoMudar;
        this.disconnect = vi.fn();
        observadores.push(this);
      }
      observe() {}
    }
    vi.stubGlobal('IntersectionObserver', FalsoObservador);
    const carregar = vi.fn(async (n) => pagina(n));
    function Lista() {
      const lista = useListaInfinita(carregar, []);
      return (
        <>
          <p>{lista.itens.length} itens</p>
          <div ref={lista.sentinelaRef} />
        </>
      );
    }

    render(<Lista />);
    await screen.findByText('2 itens');
    await waitFor(() => expect(observadores.length).toBeGreaterThan(0));

    await act(async () =>
      observadores.at(-1).aoMudar([{ isIntersecting: true }]),
    );

    expect(await screen.findByText('4 itens')).toBeInTheDocument();
  });
});
