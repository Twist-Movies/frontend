import { describe, expect, it } from 'vitest';
import { corpoDaRequisicao } from './body';

describe('corpoDaRequisicao', () => {
  it('devolve um objeto JSON quando não há arquivo, sem campos undefined', () => {
    expect(
      corpoDaRequisicao({ name: 'A', description: undefined, ok: false }),
    ).toEqual({ name: 'A', ok: false });
  });

  it('ignora arquivos vazios', () => {
    expect(corpoDaRequisicao({ name: 'A' }, { cover: null })).toEqual({
      name: 'A',
    });
  });

  it('usa FormData quando há arquivo, convertendo valores em texto', () => {
    const arquivo = new File(['x'], 'c.png', { type: 'image/png' });
    const form = corpoDaRequisicao(
      { name: 'A', is_public: true, birth_date: null },
      { cover: arquivo },
    );

    expect(form).toBeInstanceOf(FormData);
    expect(form.get('name')).toBe('A');
    expect(form.get('is_public')).toBe('true');
    expect(form.get('birth_date')).toBe('');
    expect(form.get('cover')).toBeInstanceOf(File);
  });
});
