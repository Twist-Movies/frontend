import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';

function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid="location">{location.pathname + location.search}</span>
  );
}

function renderTopBar(onLogFilm = vi.fn(), route = '/') {
  render(
    <MemoryRouter initialEntries={[route]}>
      <TopBar username="davi" onLogFilm={onLogFilm} onSignOut={vi.fn()} />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return { onLogFilm };
}

describe('TopBar', () => {
  it('leva a marca para o início e expõe a navegação principal', () => {
    renderTopBar();

    expect(screen.getByRole('link', { name: 'TWIST' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute(
      'href',
      '/filmes',
    );
    expect(screen.getByRole('link', { name: 'Séries' })).toHaveAttribute(
      'href',
      '/series',
    );
    expect(screen.getByRole('link', { name: 'Listas' })).toHaveAttribute(
      'href',
      '/listas',
    );
    expect(screen.getByRole('link', { name: 'Membros' })).toHaveAttribute(
      'href',
      '/membros',
    );
  });

  it('destaca a seção atual', () => {
    renderTopBar(vi.fn(), '/filmes');

    expect(screen.getByRole('link', { name: 'Filmes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Listas' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('busca levando o termo na query string', async () => {
    renderTopBar();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar filmes e séries' }),
      'bacurau{Enter}',
    );

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/busca?q=bacurau',
    );
  });

  it('codifica caracteres especiais no termo buscado', async () => {
    renderTopBar();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar filmes e séries' }),
      'ficção & cia{Enter}',
    );

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/busca?q=fic%C3%A7%C3%A3o%20%26%20cia',
    );
  });

  it('ignora busca vazia ou só com espaços', async () => {
    renderTopBar();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar filmes e séries' }),
      '   {Enter}',
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('aciona o registro de filme', async () => {
    const { onLogFilm } = renderTopBar();

    await userEvent.click(screen.getByRole('button', { name: '+ Registrar' }));

    expect(onLogFilm).toHaveBeenCalledOnce();
  });
});
