import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithAuth } from '../../test/utils';
import { ApiError } from '../../api/errors';
import { avaliarFilme, buscarFilmes, marcarAssistido } from '../../api/movies';
import { criarResenha } from '../../api/reviews';
import { LogFilmModal } from './LogFilmModal';

vi.mock('../../api/movies', () => ({
  buscarFilmes: vi.fn(),
  marcarAssistido: vi.fn(),
  avaliarFilme: vi.fn(),
}));
vi.mock('../../api/reviews', () => ({ criarResenha: vi.fn() }));

function Local() {
  return <p data-testid="local">{useLocation().pathname}</p>;
}

function renderizar(onClose = vi.fn()) {
  renderWithAuth(
    <>
      <LogFilmModal open onClose={onClose} />
      <Routes>
        <Route path="*" element={<Local />} />
      </Routes>
    </>,
  );
  return { onClose };
}

async function escolherMatrix() {
  await userEvent.type(screen.getByLabelText('Buscar filme'), 'matrix');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await userEvent.click(await screen.findByRole('button', { name: /Matrix/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
  buscarFilmes.mockResolvedValue({
    results: [{ tmdb_id: 603, title: 'Matrix', release_date: '1999-03-30' }],
  });
  marcarAssistido.mockResolvedValue({});
  avaliarFilme.mockResolvedValue({});
  criarResenha.mockResolvedValue({});
});

describe('LogFilmModal', () => {
  it('busca o filme e registra com nota e resenha', async () => {
    const { onClose } = renderizar();
    await escolherMatrix();

    await userEvent.click(screen.getByRole('radio', { name: '4 estrelas' }));
    await userEvent.type(screen.getByLabelText('Resenha (opcional)'), 'Ótimo');
    await userEvent.click(
      screen.getByRole('button', { name: 'Registrar como assistido' }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(buscarFilmes).toHaveBeenCalledWith({ q: 'matrix' });
    expect(marcarAssistido).toHaveBeenCalledWith(603);
    expect(avaliarFilme).toHaveBeenCalledWith(603, 4);
    expect(criarResenha).toHaveBeenCalledWith(603, {
      content: 'Ótimo',
      containsSpoiler: false,
    });
    expect(screen.getByTestId('local')).toHaveTextContent('/filme/603');
  });

  it('registra só como assistido quando não há nota nem resenha', async () => {
    renderizar();
    await escolherMatrix();

    await userEvent.click(
      screen.getByRole('button', { name: 'Registrar como assistido' }),
    );

    await waitFor(() => expect(marcarAssistido).toHaveBeenCalledWith(603));
    expect(avaliarFilme).not.toHaveBeenCalled();
    expect(criarResenha).not.toHaveBeenCalled();
  });

  it('permite trocar de filme', async () => {
    renderizar();
    await escolherMatrix();

    await userEvent.click(screen.getByRole('button', { name: 'Trocar' }));

    expect(screen.getByLabelText('Buscar filme')).toBeInTheDocument();
  });

  it('avisa quando nada é encontrado', async () => {
    buscarFilmes.mockResolvedValue({ results: [] });
    renderizar();

    await userEvent.type(screen.getByLabelText('Buscar filme'), 'zzz');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Nenhum filme encontrado.')).toBeInTheDocument();
  });

  it('mostra o erro e mantém o modal aberto', async () => {
    marcarAssistido.mockRejectedValue(new ApiError(503, 'TMDB indisponível.'));
    const { onClose } = renderizar();
    await escolherMatrix();

    await userEvent.click(
      screen.getByRole('button', { name: 'Registrar como assistido' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'TMDB indisponível.',
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
