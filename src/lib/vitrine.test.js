import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/errors';
import { buscarFilmes } from '../api/movies';
import { VITRINE, carregarVitrine } from './vitrine';

vi.mock('../api/movies', () => ({ buscarFilmes: vi.fn() }));

const filme = (i, extra = {}) => ({
  tmdb_id: 100 + i,
  title: VITRINE[i].titulo,
  release_date: `${VITRINE[i].ano}-05-01`,
  poster_path: `/p${i}.jpg`,
  tmdb_rating_average: 8,
  ...extra,
});

// Responde cada busca com o filme da posição correspondente na vitrine.
function respostasPadrao() {
  buscarFilmes.mockImplementation(async ({ q }) => {
    const i = VITRINE.findIndex(({ titulo }) => titulo === q);
    return { results: [filme(i)] };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('carregarVitrine', () => {
  it('busca cada título da lista e monta os itens do carrossel', async () => {
    respostasPadrao();

    const itens = await carregarVitrine();

    expect(buscarFilmes).toHaveBeenCalledTimes(VITRINE.length);
    expect(buscarFilmes).toHaveBeenCalledWith({ q: 'Cidade de Deus' });
    expect(itens).toHaveLength(VITRINE.length);
    expect(itens[0]).toEqual({
      id: 100,
      title: 'Cidade de Deus',
      year: 2002,
      posterUrl: 'https://image.tmdb.org/t/p/w342/p0.jpg',
      averageRating: 4,
    });
  });

  it('prefere o resultado do ano esperado', async () => {
    buscarFilmes.mockImplementation(async ({ q }) => {
      const i = VITRINE.findIndex(({ titulo }) => titulo === q);
      return {
        results: [
          filme(i, { tmdb_id: 900 + i, release_date: '1950-01-01' }),
          filme(i),
        ],
      };
    });

    const itens = await carregarVitrine();

    expect(itens[0].id).toBe(100);
  });

  it('usa o primeiro resultado com pôster quando o ano não bate', async () => {
    buscarFilmes.mockImplementation(async ({ q }) => {
      const i = VITRINE.findIndex(({ titulo }) => titulo === q);
      return {
        results: [
          filme(i, { tmdb_id: 800 + i, poster_path: null }),
          filme(i, { tmdb_id: 700 + i, release_date: '1950-01-01' }),
        ],
      };
    });

    const itens = await carregarVitrine();

    expect(itens[0].id).toBe(700);
  });

  it('ignora títulos sem resultado e falhas isoladas', async () => {
    buscarFilmes.mockImplementation(async ({ q }) => {
      const i = VITRINE.findIndex(({ titulo }) => titulo === q);
      if (i === 0) throw new ApiError(503, 'TMDB fora do ar.');
      if (i === 1) return { results: [] };
      return { results: [filme(i)] };
    });

    const itens = await carregarVitrine();

    expect(itens).toHaveLength(VITRINE.length - 2);
  });

  it('não repete o mesmo filme', async () => {
    buscarFilmes.mockResolvedValue({ results: [filme(0)] });

    const itens = await carregarVitrine();

    expect(itens).toHaveLength(1);
  });

  it('repassa o erro quando nenhuma busca funciona', async () => {
    buscarFilmes.mockRejectedValue(new ApiError(0, 'Sem conexão.'));

    await expect(carregarVitrine()).rejects.toThrow('Sem conexão.');
  });

  it('guarda o resultado e não consulta de novo enquanto vale', async () => {
    respostasPadrao();
    await carregarVitrine();
    buscarFilmes.mockClear();

    const itens = await carregarVitrine();

    expect(buscarFilmes).not.toHaveBeenCalled();
    expect(itens).toHaveLength(VITRINE.length);
  });

  it('consulta de novo quando o cache venceu', async () => {
    respostasPadrao();
    await carregarVitrine();
    const guardado = JSON.parse(localStorage.getItem('twist:vitrine:v1'));
    guardado.salvoEm = Date.now() - 7 * 60 * 60 * 1000;
    localStorage.setItem('twist:vitrine:v1', JSON.stringify(guardado));
    buscarFilmes.mockClear();

    await carregarVitrine();

    expect(buscarFilmes).toHaveBeenCalledTimes(VITRINE.length);
  });

  it('ignora um cache corrompido', async () => {
    localStorage.setItem('twist:vitrine:v1', '{não é json');
    respostasPadrao();

    await expect(carregarVitrine()).resolves.toHaveLength(VITRINE.length);
  });
});
