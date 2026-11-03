import { describe, expect, it } from 'vitest';
import { anoDe, duracao, imagemTmdb, notaEm5 } from './tmdbImage';

describe('imagemTmdb', () => {
  it('monta a URL a partir do caminho relativo', () => {
    expect(imagemTmdb('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
    expect(imagemTmdb('/abc.jpg', 'w1280')).toBe(
      'https://image.tmdb.org/t/p/w1280/abc.jpg',
    );
  });

  it('devolve undefined sem caminho', () => {
    expect(imagemTmdb(null)).toBeUndefined();
  });
});

describe('anoDe', () => {
  it('extrai o ano de uma data ISO', () => {
    expect(anoDe('1999-03-30')).toBe(1999);
  });

  it('devolve undefined para datas vazias ou inválidas', () => {
    expect(anoDe(null)).toBeUndefined();
    expect(anoDe('')).toBeUndefined();
    expect(anoDe('abcd-01-01')).toBeUndefined();
  });
});

describe('notaEm5', () => {
  it('converte 0–10 em 0–5 com meias estrelas', () => {
    expect(notaEm5(8)).toBe(4);
    expect(notaEm5(7)).toBe(3.5);
  });

  it('ignora notas ausentes ou zeradas', () => {
    expect(notaEm5(0)).toBeUndefined();
    expect(notaEm5(null)).toBeUndefined();
  });
});

describe('duracao', () => {
  it('formata horas e minutos', () => {
    expect(duracao(136)).toBe('2h 16min');
    expect(duracao(45)).toBe('45min');
  });

  it('devolve undefined sem duração', () => {
    expect(duracao(null)).toBeUndefined();
  });
});
