import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../../test/utils';
import { AppShell } from './AppShell';

function renderShell() {
  renderWithAuth(
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<p>conteúdo da página</p>} />
      </Route>
    </Routes>,
  );
}

describe('AppShell', () => {
  it('renderiza topo, conteúdo da rota e rodapé', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'TWIST' })).toBeInTheDocument();
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('abre o modal de registro a partir do topo e fecha de volta', async () => {
    renderShell();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '+ Registrar' }));
    expect(
      screen.getByRole('dialog', { name: 'Registrar filme' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
