import { describe, expect, it } from 'vitest';
import {
  errosDaApiNoFormulario,
  validarCadastro,
  validarLogin,
} from './validacao';

describe('validarLogin', () => {
  it('cobra identificador e senha', () => {
    expect(validarLogin({ identifier: '  ', password: '' })).toEqual({
      identifier: 'Informe seu e-mail ou usuário.',
      password: 'Informe sua senha.',
    });
  });

  it('aceita e-mail ou username sem validar formato', () => {
    expect(validarLogin({ identifier: 'davi', password: 'x' })).toEqual({});
  });
});

const VALIDO = {
  firstName: 'Davi',
  lastName: 'Almeida',
  username: 'davi.almeida',
  email: 'davi@twist.app',
  birthDate: '1999-05-10',
  password: 'senhaforte1',
  avatar: null,
};

function arquivo(type, bytes = 10) {
  return { type, size: bytes };
}

describe('validarCadastro', () => {
  it('aceita um cadastro válido', () => {
    expect(validarCadastro(VALIDO)).toEqual({});
  });

  it('cobra todos os obrigatórios da spec', () => {
    const erros = validarCadastro({
      ...VALIDO,
      firstName: '',
      lastName: ' ',
      username: '',
      email: '',
      birthDate: '',
      password: '',
    });

    expect(Object.keys(erros).sort()).toEqual([
      'birthDate',
      'email',
      'firstName',
      'lastName',
      'password',
      'username',
    ]);
  });

  it('segue os caracteres aceitos pelo username do Django', () => {
    expect(validarCadastro({ ...VALIDO, username: 'a+b-c_d@e.f' })).toEqual({});
    expect(
      validarCadastro({ ...VALIDO, username: 'com espaço' }).username,
    ).toMatch(/sem espaços/);
    expect(
      validarCadastro({ ...VALIDO, username: 'x'.repeat(151) }).username,
    ).toBe('Máximo de 150 caracteres.');
  });

  it('recusa e-mail malformado', () => {
    expect(validarCadastro({ ...VALIDO, email: 'davi-arroba' }).email).toBe(
      'E-mail inválido.',
    );
  });

  it('recusa data de nascimento no futuro', () => {
    expect(
      validarCadastro({ ...VALIDO, birthDate: '2999-01-01' }).birthDate,
    ).toBe('A data de nascimento não pode ser no futuro.');
  });

  it('espelha as regras de senha do Django', () => {
    expect(validarCadastro({ ...VALIDO, password: 'curta1' }).password).toBe(
      'A senha precisa ter pelo menos 8 caracteres.',
    );
    expect(validarCadastro({ ...VALIDO, password: '12345678' }).password).toBe(
      'A senha não pode ter apenas números.',
    );
  });

  it('valida formato e tamanho da foto', () => {
    expect(
      validarCadastro({ ...VALIDO, avatar: arquivo('image/webp') }),
    ).toEqual({});
    expect(
      validarCadastro({ ...VALIDO, avatar: arquivo('image/gif') }).avatar,
    ).toMatch(/JPEG, PNG ou WebP/);
    expect(
      validarCadastro({
        ...VALIDO,
        avatar: arquivo('image/png', 5 * 1024 * 1024 + 1),
      }).avatar,
    ).toBe('A imagem deve ter no máximo 5MB.');
  });
});

describe('errosDaApiNoFormulario', () => {
  it('traduz os nomes de campo da API para os do formulário', () => {
    expect(
      errosDaApiNoFormulario({
        birth_date: 'a',
        first_name: 'b',
        last_name: 'c',
        email: 'd',
      }),
    ).toEqual({ birthDate: 'a', firstName: 'b', lastName: 'c', email: 'd' });
  });
});
