import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/utils';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa fechado', () => {
    renderWithRouter(<UserMenu username="davi" onSignOut={vi.fn()} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Menu da conta' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre com os atalhos do usuário apontando para as rotas dele', async () => {
    renderWithRouter(<UserMenu username="davi" onSignOut={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Meu perfil' }),
    ).toHaveAttribute('href', '/u/davi');
    expect(screen.getByRole('menuitem', { name: 'Diário' })).toHaveAttribute(
      'href',
      '/u/davi/diario',
    );
  });

  it('fecha com Escape', async () => {
    renderWithRouter(<UserMenu username="davi" onSignOut={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('fecha ao clicar fora', async () => {
    renderWithRouter(
      <div>
        <UserMenu username="davi" onSignOut={vi.fn()} />
        <button>fora</button>
      </div>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'fora' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('fecha ao escolher um item', async () => {
    renderWithRouter(<UserMenu username="davi" onSignOut={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Minhas listas' }),
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('alterna o tema sem fechar o menu', async () => {
    renderWithRouter(<UserMenu username="davi" onSignOut={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );
    expect(
      screen.getByRole('menuitem', { name: /Tema: escuro/ }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('menuitem', { name: /Tema: escuro/ }),
    );

    expect(
      screen.getByRole('menuitem', { name: /Tema: claro/ }),
    ).toBeInTheDocument();
  });
  it('encerra a sessão pelo item Sair', async () => {
    const onSignOut = vi.fn();
    renderWithRouter(<UserMenu username="davi" onSignOut={onSignOut} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Menu da conta' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));

    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
