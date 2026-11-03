import { describe, expect, it } from 'vitest';
import { formatarData, nomeCompleto } from './formatar';

describe('formatarData', () => {
  it('formata em pt-BR', () => {
    expect(formatarData('2026-10-28T12:00:00Z')).toBe('28/10/2026');
  });

  it('devolve vazio para valores ausentes ou inválidos', () => {
    expect(formatarData(null)).toBe('');
    expect(formatarData('não é data')).toBe('');
  });
});

describe('nomeCompleto', () => {
  it('junta nome e sobrenome', () => {
    expect(nomeCompleto({ first_name: 'Davi', last_name: 'Almeida' })).toBe(
      'Davi Almeida',
    );
  });

  it('tolera campos vazios', () => {
    expect(nomeCompleto({ first_name: '', last_name: null })).toBe('');
  });
});
