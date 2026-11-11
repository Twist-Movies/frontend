import { describe, expect, it } from 'vitest';
import {
  aplicarMascaraData,
  dataParaIso,
  isoParaData,
  validarDataNascimento,
} from './dataNascimento';

describe('aplicarMascaraData', () => {
  it.each([
    ['', ''],
    [undefined, ''],
    ['1', '1'],
    ['10', '10'],
    ['100', '10/0'],
    ['1005', '10/05'],
    ['10051', '10/05/1'],
    ['10/05/1999', '10/05/1999'],
    ['100519999999', '10/05/1999'],
    ['ab10-05x1999', '10/05/1999'],
  ])('%s -> %s', (entrada, saida) => {
    expect(aplicarMascaraData(entrada)).toBe(saida);
  });
});

describe('dataParaIso / isoParaData', () => {
  it('converte nos dois sentidos', () => {
    expect(dataParaIso('10/05/1999')).toBe('1999-05-10');
    expect(isoParaData('1999-05-10')).toBe('10/05/1999');
    expect(isoParaData('1999-05-10T00:00:00Z')).toBe('10/05/1999');
  });

  it('devolve vazio quando inválida', () => {
    expect(dataParaIso('')).toBe('');
    expect(dataParaIso('10/05/19')).toBe('');
    expect(dataParaIso('31/02/2000')).toBe('');
    expect(dataParaIso('00/10/2000')).toBe('');
    expect(isoParaData('')).toBe('');
    expect(isoParaData(null)).toBe('');
    expect(isoParaData('lixo')).toBe('');
  });
});

describe('validarDataNascimento', () => {
  it('aceita data real no passado', () => {
    expect(validarDataNascimento('10/05/1999')).toBeNull();
  });

  it('recusa incompleta, inexistente, futura e muito antiga', () => {
    expect(validarDataNascimento('10/05')).toMatch(/dd\/mm\/aaaa/);
    expect(validarDataNascimento('30/02/2000')).toMatch(/válida/);
    expect(validarDataNascimento('01/01/2999')).toMatch(/futuro/);
    expect(validarDataNascimento('01/01/1850')).toMatch(/1900/);
  });
});
