import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field, Input, Textarea } from './Field';

describe('Field', () => {
  it('associa o label ao controle pelo id gerado', () => {
    render(<Field label="E-mail">{(id) => <Input id={id} />}</Field>);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('anuncia o erro e esconde a dica quando há erro', () => {
    render(
      <Field
        label="Senha"
        hint="Mínimo de 8 caracteres"
        error="Senha muito curta"
      >
        {(id) => <Input id={id} />}
      </Field>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Senha muito curta');
    expect(
      screen.queryByText('Mínimo de 8 caracteres'),
    ).not.toBeInTheDocument();
  });

  it('mostra a dica quando não há erro', () => {
    render(<Field hint="Opcional">{(id) => <Input id={id} />}</Field>);

    expect(screen.getByText('Opcional')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Input', () => {
  it('marca aria-invalid quando inválido', () => {
    render(<Input invalid aria-label="Usuário" />);

    const input = screen.getByLabelText('Usuário');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('não marca aria-invalid quando válido', () => {
    render(<Input aria-label="Usuário" />);

    expect(screen.getByLabelText('Usuário')).not.toHaveAttribute(
      'aria-invalid',
    );
  });
});

describe('Textarea', () => {
  it('renderiza e sinaliza estado inválido', () => {
    render(<Textarea invalid aria-label="Resenha" />);

    const textarea = screen.getByLabelText('Resenha');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });
});
