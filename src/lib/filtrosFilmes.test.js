import { describe, expect, it } from 'vitest';
import {
  FILTROS_VAZIOS,
  aplicarFiltrosLocais,
  filtrosDaUrl,
  paraApi,
  paraUrl,
  temFiltros,
} from './filtrosFilmes';

const url = (texto) => new URLSearchParams(texto);

describe('filtrosDaUrl', () => {
  it('usa os padrões quando o endereço não tem filtros', () => {
    expect(filtrosDaUrl(url(''))).toEqual(FILTROS_VAZIOS);
  });

  it('lê filtros válidos e o título', () => {
    expect(
      filtrosDaUrl(url('q=%20matrix%20&genero=18&decada=1990&duracao=curta&nota=8&ordem=nota')),
    ).toEqual({
      q: 'matrix',
      genero: '18',
      decada: '1990',
      duracao: 'curta',
      nota: '8',
      ordem: 'nota',
    });
  });

  it('descarta valores desconhecidos', () => {
    expect(
      filtrosDaUrl(url('genero=999&decada=1850&duracao=x&nota=1&ordem=aleatoria')),
    ).toEqual(FILTROS_VAZIOS);
  });
});

describe('paraUrl', () => {
  it('omite o que é padrão', () => {
    expect(paraUrl(FILTROS_VAZIOS).toString()).toBe('');
  });

  it('grava só o que mudou e faz o caminho de volta', () => {
    const filtros = { ...FILTROS_VAZIOS, genero: '18', ordem: 'nota' };

    expect(paraUrl(filtros).toString()).toBe('genero=18&ordem=nota');
    expect(filtrosDaUrl(paraUrl(filtros))).toEqual(filtros);
  });
});

describe('temFiltros', () => {
  it('ignora o título e considera os demais filtros', () => {
    expect(temFiltros({ ...FILTROS_VAZIOS, q: 'matrix' })).toBe(false);
    expect(temFiltros({ ...FILTROS_VAZIOS, nota: '7' })).toBe(true);
    expect(temFiltros({ ...FILTROS_VAZIOS, ordem: 'nota' })).toBe(true);
  });
});

describe('paraApi', () => {
  it('traduz os filtros para os parâmetros da rota de catálogo', () => {
    expect(
      paraApi({
        ...FILTROS_VAZIOS,
        genero: '18',
        decada: '1990',
        duracao: 'media',
        nota: '8',
        ordem: 'lancamento',
      }),
    ).toEqual({
      sort: 'release_date',
      genre: '18',
      decade: '1990',
      runtimeMin: 90,
      runtimeMax: 120,
      ratingMin: 8,
    });
  });

  it('deixa indefinido o que não foi escolhido', () => {
    expect(paraApi(FILTROS_VAZIOS)).toEqual({
      sort: 'popularity',
      genre: undefined,
      decade: undefined,
      runtimeMin: undefined,
      runtimeMax: undefined,
      ratingMin: undefined,
    });
  });

  it('mapeia durações abertas', () => {
    expect(paraApi({ ...FILTROS_VAZIOS, duracao: 'curta' })).toMatchObject({
      runtimeMin: undefined,
      runtimeMax: 90,
    });
    expect(paraApi({ ...FILTROS_VAZIOS, duracao: 'longa' })).toMatchObject({
      runtimeMin: 120,
      runtimeMax: undefined,
    });
  });
});

describe('aplicarFiltrosLocais', () => {
  const A = { tmdb_id: 1, release_date: '1995-05-01', tmdb_rating_average: 7 };
  const B = { tmdb_id: 2, release_date: '2010-05-01', tmdb_rating_average: 9 };
  const C = { tmdb_id: 3, release_date: '1999-12-31', tmdb_rating_average: 8 };
  const SEM_DATA = { tmdb_id: 4, release_date: null, tmdb_rating_average: 8 };
  const todos = [A, B, C, SEM_DATA];
  const ids = (lista) => lista.map((f) => f.tmdb_id);

  it('mantém a ordem original por padrão', () => {
    expect(ids(aplicarFiltrosLocais(todos, FILTROS_VAZIOS))).toEqual([1, 2, 3, 4]);
  });

  it('filtra por década, excluindo filmes sem data', () => {
    expect(
      ids(aplicarFiltrosLocais(todos, { ...FILTROS_VAZIOS, decada: '1990' })),
    ).toEqual([1, 3]);
  });

  it('filtra pela nota mínima', () => {
    expect(
      ids(aplicarFiltrosLocais(todos, { ...FILTROS_VAZIOS, nota: '8' })),
    ).toEqual([2, 3, 4]);
  });

  it('ordena por nota, da maior para a menor', () => {
    expect(
      ids(aplicarFiltrosLocais(todos, { ...FILTROS_VAZIOS, ordem: 'nota' }))[0],
    ).toBe(2);
  });

  it('ordena por data de lançamento, da mais recente para a mais antiga', () => {
    expect(
      ids(aplicarFiltrosLocais(todos, { ...FILTROS_VAZIOS, ordem: 'lancamento' })),
    ).toEqual([2, 3, 1, 4]);
  });

  it('combina filtros e ordenação sem alterar a lista original', () => {
    const copia = [...todos];

    const resultado = aplicarFiltrosLocais(todos, {
      ...FILTROS_VAZIOS,
      decada: '1990',
      ordem: 'nota',
    });

    expect(ids(resultado)).toEqual([3, 1]);
    expect(todos).toEqual(copia);
  });
});
