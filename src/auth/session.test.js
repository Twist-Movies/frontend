import { beforeEach, describe, expect, it, vi } from 'vitest';
import { limparSessaoLegada } from './session';

describe('limpeza da sessão legada', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('apaga o perfil (com e-mail) que versões antigas gravavam', () => {
    localStorage.setItem(
      'twist:session',
      '{"username":"davi","email":"a@b.c"}',
    );
    limparSessaoLegada();
    expect(localStorage.getItem('twist:session')).toBeNull();
  });

  it('não quebra quando o armazenamento está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => limparSessaoLegada()).not.toThrow();
  });
});
