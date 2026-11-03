import { describe, expect, it } from 'vitest';
import { avaliarSenha } from './forcaSenha';

describe('avaliarSenha', () => {
  it('classifica senha curta como fraca', () => {
    expect(avaliarSenha('abc').forca).toBe('fraca');
    expect(avaliarSenha('abc').rotulo).toBe('Fraca');
  });

  it('classifica oito caracteres simples como fraca', () => {
    expect(avaliarSenha('abcdefgh').forca).toBe('fraca');
  });

  it('sobe para média quando mistura letras e números', () => {
    expect(avaliarSenha('abcdef12').forca).toBe('media');
    expect(avaliarSenha('abcdef12').rotulo).toBe('Média');
  });

  it('chega a forte com tamanho, mistura e símbolo', () => {
    const avaliacao = avaliarSenha('abcdef123456!');

    expect(avaliacao.forca).toBe('forte');
    expect(avaliacao.pontos).toBe(4);
    expect(avaliacao.percentual).toBe(100);
  });

  it('zera o percentual quando não há senha', () => {
    expect(avaliarSenha('').percentual).toBe(0);
  });

  it('nunca mostra barra vazia para senha não vazia', () => {
    expect(avaliarSenha('a').percentual).toBe(25);
  });
});
