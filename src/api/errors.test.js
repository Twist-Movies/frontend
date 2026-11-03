import { describe, expect, it } from 'vitest';
import { ApiError, erroDaResposta, erroDeRede, traduzir } from './errors';

describe('ApiError', () => {
  it('classifica 4xx como erro de cliente', () => {
    expect(new ApiError(400, 'x').isClientError).toBe(true);
    expect(new ApiError(401, 'x').isClientError).toBe(true);
  });

  it('não classifica 5xx nem falha de rede como erro de cliente', () => {
    expect(new ApiError(500, 'x').isClientError).toBe(false);
    expect(new ApiError(0, 'x').isClientError).toBe(false);
  });
});

describe('erroDaResposta', () => {
  it('usa mensagem genérica em 5xx, sem vazar detalhes do servidor', () => {
    const erro = erroDaResposta(500, '<html>Traceback…</html>');
    expect(erro.status).toBe(500);
    expect(erro.message).toMatch(/tente novamente/i);
  });

  it('lê o formato { error } do login', () => {
    const erro = erroDaResposta(401, { error: 'Invalid credentials' });
    expect(erro.message).toBe('E-mail, usuário ou senha incorretos.');
  });

  it('lê o formato { detail } do DRF', () => {
    expect(erroDaResposta(403, { detail: 'Sem permissão.' }).message).toBe(
      'Sem permissão.',
    );
  });

  it('separa os erros por campo e traduz os conhecidos', () => {
    const erro = erroDaResposta(400, {
      email: ['user with this email already exists.'],
      password: [
        'This password is too short. It must contain at least 8 characters.',
      ],
      username: ['Mensagem que o front não conhece.'],
    });

    expect(erro.fieldErrors).toEqual({
      email: 'Já existe uma conta com este e-mail.',
      password: 'A senha precisa ter pelo menos 8 caracteres.',
      username: 'Mensagem que o front não conhece.',
    });
    expect(erro.message).toBe('Confira os campos destacados.');
  });

  it('usa non_field_errors como mensagem geral', () => {
    const erro = erroDaResposta(400, {
      non_field_errors: ['Dados inconsistentes.'],
    });
    expect(erro.message).toBe('Dados inconsistentes.');
    expect(erro.fieldErrors).toEqual({});
  });

  it('ignora valores que não são mensagem e cai na genérica sem campos', () => {
    const erro = erroDaResposta(400, { codigo: 42 });
    expect(erro.fieldErrors).toEqual({});
    expect(erro.message).toMatch(/tente novamente/i);
  });
});

describe('traduzir', () => {
  it('devolve a mensagem original quando não conhece', () => {
    expect(traduzir('Algo novo.')).toBe('Algo novo.');
  });
});

describe('erroDeRede', () => {
  it('é status 0 e fala de conexão', () => {
    const erro = erroDeRede();
    expect(erro.status).toBe(0);
    expect(erro.message).toMatch(/conexão/i);
  });
});
