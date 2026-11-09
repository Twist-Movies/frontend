import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithRouter } from '../../test/utils';
import { PessoaCard } from './PessoaCard';

const PESSOA = {
  id: 5,
  username: 'ana',
  first_name: 'Ana',
  last_name: 'Souza',
  avatar_url: null,
};

function Local() {
  const { pathname, state } = useLocation();
  return (
    <p data-testid="local">
      {pathname} {state?.pessoa?.id}
    </p>
  );
}

describe('PessoaCard', () => {
  it('mostra nome, usuário e o detalhe', () => {
    renderWithRouter(
      <PessoaCard
        pessoa={PESSOA}
        seguindo={false}
        onAlternar={vi.fn()}
        detalhe="2 conexões em comum"
      />,
    );

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('@ana')).toBeInTheDocument();
    expect(screen.getByText('2 conexões em comum')).toBeInTheDocument();
  });

  it('usa o username quando a pessoa não tem nome', () => {
    renderWithRouter(
      <PessoaCard
        pessoa={{ ...PESSOA, first_name: '', last_name: '' }}
        seguindo={false}
        onAlternar={vi.fn()}
      />,
    );

    expect(screen.getByText('ana')).toBeInTheDocument();
  });

  it('oferece seguir e avisa quem foi clicado', async () => {
    const onAlternar = vi.fn();
    renderWithRouter(<PessoaCard pessoa={PESSOA} seguindo={false} onAlternar={onAlternar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Seguir ana' }));

    expect(onAlternar).toHaveBeenCalledWith(PESSOA);
  });

  it('oferece deixar de seguir quando já segue', () => {
    renderWithRouter(<PessoaCard pessoa={PESSOA} seguindo onAlternar={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Deixar de seguir ana' }),
    ).toBeInTheDocument();
  });

  it('desabilita o botão enquanto a ação está em andamento', () => {
    renderWithRouter(<PessoaCard pessoa={PESSOA} seguindo={false} ocupado onAlternar={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Seguir ana' })).toBeDisabled();
  });

  it('leva ao perfil da pessoa, com os dados dela na navegação', async () => {
    renderWithRouter(
      <>
        <PessoaCard pessoa={PESSOA} seguindo={false} onAlternar={vi.fn()} />
        <Routes>
          <Route path="*" element={<Local />} />
        </Routes>
      </>,
    );
    const link = screen.getByRole('link', { name: 'Ana Souza' });
    expect(link).toHaveAttribute('href', '/u/ana');

    await userEvent.click(link);

    expect(screen.getByTestId('local')).toHaveTextContent('/u/ana 5');
  });
});
