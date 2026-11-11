import { describe, expect, it } from 'vitest';
import {
  agruparEquipe,
  classificacaoIndicativa,
  generosComId,
  inicial,
} from './filme';

describe('classificacaoIndicativa', () => {
  it.each(['L', '10', '12', '14', '16', '18', 'livre', '12 anos'])(
    'mapeia %s',
    (valor) => expect(classificacaoIndicativa(valor)).not.toBeNull(),
  );
  it('ignora valores desconhecidos ou vazios', () => {
    expect(classificacaoIndicativa('PG-13')).toBeNull();
    expect(classificacaoIndicativa('')).toBeNull();
    expect(classificacaoIndicativa(null)).toBeNull();
    expect(classificacaoIndicativa(undefined)).toBeNull();
  });
});

describe('generosComId', () => {
  it('prefere genres_info', () => {
    expect(
      generosComId({
        genres: ['Ação'],
        genres_info: [{ id: 28, name: 'Ação' }],
      }),
    ).toEqual([{ id: 28, nome: 'Ação' }]);
  });
  it('mapeia por nome sem acento nem caixa', () => {
    expect(generosComId({ genres: ['ficcao cientifica', 'Xyz'] })).toEqual([
      { id: 878, nome: 'ficcao cientifica' },
      { id: undefined, nome: 'Xyz' },
    ]);
  });
  it('tolera ausência de genres', () => {
    expect(generosComId({})).toEqual([]);
  });
});

describe('agruparEquipe', () => {
  it('agrupa, ordena e remove duplicados', () => {
    const grupos = agruparEquipe([
      { id: 1, name: 'A', job: 'Producer' },
      { id: 2, name: 'B', job: 'Director' },
      { id: 2, name: 'B', job: 'Director' },
      { id: 3, name: 'C', job: 'Screenplay' },
      { id: 3, name: 'C', job: 'Writer' },
      { id: 4, name: 'D', job: 'Director of Photography' },
      { id: 5, name: 'E', job: 'Original Music Composer' },
      { id: 6, name: 'F', job: 'Gaffer' },
    ]);
    expect(grupos.map((g) => g.titulo)).toEqual([
      'Direção',
      'Roteiro',
      'Fotografia',
      'Música',
      'Produção',
    ]);
    expect(grupos[1].pessoas).toHaveLength(1);
  });
  it('aceita equipe ausente', () => {
    expect(agruparEquipe()).toEqual([]);
  });
});

describe('inicial', () => {
  it('devolve a inicial maiúscula', () => {
    expect(inicial('ana')).toBe('A');
    expect(inicial('')).toBe('?');
    expect(inicial(undefined)).toBe('?');
  });
});
