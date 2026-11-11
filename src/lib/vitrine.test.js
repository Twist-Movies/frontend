import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/errors';
import { descobrirFilmes } from '../api/discover';
import { buscarFilmes } from '../api/movies';
import { VITRINE, carregarVitrine } from './vitrine';

vi.mock('../api/discover', () => ({ descobrirFilmes: vi.fn() }));
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
  descobrirFilmes.mockRejectedValue(new ApiError(404, 'Not found.'));
});

const populares = (quantidade, extra = {}) =>
  Array.from({ length: quantidade }, (_, i) => ({
    tmdb_id: 500 + i,
    title: `Popular ${i}`,
    release_date: '2020-01-01',
    poster_path: `/pop${i}.jpg`,
    tmdb_rating_average: 7,
    ...extra,
  }));

describe('carregarVitrine (catálogo)', () => {
  it('usa os filmes mais populares do catálogo, sem buscar um a um', async () => {
    descobrirFilmes.mockResolvedValue({ results: populares(3) });

    const itens = await carregarVitrine();

    expect(descobrirFilmes).toHaveBeenCalledWith({
      page: 1,
      sort: 'popularity',
    });
    expect(buscarFilmes).not.toHaveBeenCalled();
    expect(itens[0]).toEqual({
      id: 500,
      title: 'Popular 0',
      year: 2020,
      posterUrl: 'https://image.tmdb.org/t/p/w342/pop0.jpg',
      averageRating: 3.5,
    });
  });

  it('descarta filmes sem pôster e limita a 18', async () => {
    descobrirFilmes.mockResolvedValue({
      results: [
        ...populares(1, { tmdb_id: 900, poster_path: null }),
        ...populares(25),
      ],
    });

    const itens = await carregarVitrine();

    expect(itens).toHaveLength(18);
    expect(itens.some((item) => item.id === 900)).toBe(false);
  });

  it('não repete o mesmo filme', async () => {
    const [filme] = populares(1);
    descobrirFilmes.mockResolvedValue({ results: [filme, filme] });

    await expect(carregarVitrine()).resolves.toHaveLength(1);
  });

  it('guarda o resultado e não consulta de novo enquanto vale', async () => {
    descobrirFilmes.mockResolvedValue({ results: populares(3) });
    await carregarVitrine();
    descobrirFilmes.mockClear();

    const itens = await carregarVitrine();

    expect(descobrirFilmes).not.toHaveBeenCalled();
    expect(itens).toHaveLength(3);
  });

  it.each([
    ['a rota ainda não existe (404)', new ApiError(404, 'Not found.')],
    ['o TMDB está fora do ar (503)', new ApiError(503, 'TMDB indisponível.')],
    ['não há conexão', new ApiError(0, 'Sem conexão.')],
  ])('cai para a lista curada quando %s', async (_caso, erro) => {
    descobrirFilmes.mockRejectedValue(erro);
    respostasPadrao();

    const itens = await carregarVitrine();

    expect(buscarFilmes).toHaveBeenCalledTimes(VITRINE.length);
    expect(itens).toHaveLength(VITRINE.length);
  });

  it('cai para a lista curada quando o catálogo vem vazio', async () => {
    descobrirFilmes.mockResolvedValue({ results: [] });
    respostasPadrao();

    await expect(carregarVitrine()).resolves.toHaveLength(VITRINE.length);
  });

  it('dá erro quando o catálogo e a lista curada falham', async () => {
    descobrirFilmes.mockRejectedValue(new ApiError(404, 'Not found.'));
    buscarFilmes.mockRejectedValue(new ApiError(0, 'Sem conexão.'));

    await expect(carregarVitrine()).rejects.toThrow('Sem conexão.');
  });
});

describe('carregarVitrine (lista curada)', () => {
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
    const guardado = JSON.parse(localStorage.getItem('twist:vitrine:v2'));
    guardado.salvoEm = Date.now() - 7 * 60 * 60 * 1000;
    localStorage.setItem('twist:vitrine:v2', JSON.stringify(guardado));
    buscarFilmes.mockClear();

    await carregarVitrine();

    expect(buscarFilmes).toHaveBeenCalledTimes(VITRINE.length);
  });

  it('ignora um cache corrompido', async () => {
    localStorage.setItem('twist:vitrine:v2', '{não é json');
    respostasPadrao();

    await expect(carregarVitrine()).resolves.toHaveLength(VITRINE.length);
  });
});
