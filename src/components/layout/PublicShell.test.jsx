import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PublicShell } from './PublicShell';

function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid="location">{location.pathname + location.search}</span>
  );
}

function montar(rota = '/entrar') {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/entrar" element={<p>formulário</p>} />
          <Route path="/boas-vindas" element={<p>landing</p>} />
        </Route>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicShell', () => {
  it('renderiza a marca, o conteúdo e o rodapé', () => {
    montar();

    expect(screen.getByRole('link', { name: 'TWIST' })).toHaveAttribute(
      'href',
      '/boas-vindas',
    );
    expect(screen.getByText('formulário')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('leva a navegação do visitante às seções da landing', () => {
    montar();

    expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute(
      'href',
      '/boas-vindas#filmes',
    );
    expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute(
      'href',
      '/boas-vindas#series',
    );
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/entrar',
    );
  });

  it('não expõe o menu de conta ao visitante', () => {
    montar();

    expect(
      screen.queryByRole('button', { name: 'Menu da conta' }),
    ).not.toBeInTheDocument();
  });

  it('deixa o topo transparente só sobre o hero da landing', () => {
    montar('/boas-vindas');
    expect(screen.getByRole('banner')).toHaveAttribute('data-overlay');
  });

  it('dá fundo ao topo fora da landing', () => {
    montar('/entrar');
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-overlay');
  });

  it('a busca do visitante leva o termo para /busca', async () => {
    montar();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar filmes e séries' }),
      'bacurau{Enter}',
    );

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/busca?q=bacurau',
    );
  });
});
