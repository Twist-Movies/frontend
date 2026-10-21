import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormAviso } from './FormAviso';
import { ApiError } from '../api/errors';

describe('FormAviso', () => {
  it('não renderiza nada sem erro', () => {
    const { container } = render(<FormAviso erro={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('trata 4xx como conversa normal com o usuário', () => {
    render(
      <FormAviso
        erro={new ApiError(401, 'E-mail, usuário ou senha incorretos.')}
      />,
    );

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('E-mail, usuário ou senha incorretos.');
    expect(aviso).toHaveAttribute('data-tone', 'cliente');
  });

  it('trata 5xx como falha de sistema', () => {
    render(<FormAviso erro={new ApiError(500, 'Servidor indisponível.')} />);

    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'servidor');
  });

  it('trata falha de rede (status 0) como falha de sistema', () => {
    render(<FormAviso erro={new ApiError(0, 'Sem conexão.')} />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('Sem conexão.');
    expect(aviso).toHaveAttribute('data-tone', 'servidor');
  });

  it('usa mensagem genérica para erro que não é ApiError', () => {
    render(<FormAviso erro={new Error('bug interno')} />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent(/Não foi possível completar a operação/);
    expect(aviso).toHaveAttribute('data-tone', 'servidor');
  });
});
