import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormAviso } from './FormAviso';
import { AuthError } from './session';

describe('FormAviso', () => {
  it('não renderiza nada sem erro', () => {
    const { container } = render(<FormAviso erro={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('trata 4xx como conversa normal com o usuário', () => {
    render(
      <FormAviso
        erro={new AuthError('credenciais', 401, 'E-mail ou senha incorretos.')}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('E-mail ou senha incorretos.');
    expect(aviso).toHaveAttribute('data-tone', 'cliente');
  });

  it('trata 5xx como falha de sistema', () => {
    render(
      <FormAviso
        erro={new AuthError('servidor', 500, 'Servidor indisponível.')}
      />,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'servidor');
  });

  it('usa mensagem genérica para erro que não é AuthError', () => {
    render(<FormAviso erro={new Error('falha de rede')} />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent(/Não foi possível completar a operação/);
    expect(aviso).toHaveAttribute('data-tone', 'servidor');
  });
});
