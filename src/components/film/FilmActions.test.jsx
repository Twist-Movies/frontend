import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../api/errors';
import * as api from '../../api/movies';
import { FilmActions } from './FilmActions';

vi.mock('../../api/movies', () => ({
  marcarAssistido: vi.fn(),
  desmarcarAssistido: vi.fn(),
  adicionarAWatchlist: vi.fn(),
  removerDaWatchlist: vi.fn(),
  avaliarFilme: vi.fn(),
  removerAvaliacao: vi.fn(),
  reagirAoFilme: vi.fn(),
  removerReacao: vi.fn(),
}));

const ESTADO = { watched: false, in_watchlist: false, reaction: null, rating: null };

function renderizar(estado = {}) {
  const onChanged = vi.fn();
  const onAddToList = vi.fn();
  render(
    <FilmActions
      tmdbId={603}
      estado={{ ...ESTADO, ...estado }}
      onChanged={onChanged}
      onAddToList={onAddToList}
    />,
  );
  return { onChanged, onAddToList };
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.values(api).forEach((fn) => fn.mockResolvedValue({}));
});

describe('FilmActions', () => {
  it.each([
    ['Assistido', {}, 'marcarAssistido', [603]],
    ['Assistido', { watched: true }, 'desmarcarAssistido', [603]],
    ['Quero assistir', {}, 'adicionarAWatchlist', [603]],
    ['Quero assistir', { in_watchlist: true }, 'removerDaWatchlist', [603]],
    ['Gostei', {}, 'reagirAoFilme', [603, 'LIKE']],
    ['Gostei', { reaction: 'LIKE' }, 'removerReacao', [603]],
    ['Não gostei', {}, 'reagirAoFilme', [603, 'DISLIKE']],
    ['Não gostei', { reaction: 'DISLIKE' }, 'removerReacao', [603]],
  ])('botão %s com %j chama %s', async (rotulo, estado, funcao, args) => {
    const { onChanged } = renderizar(estado);

    await userEvent.click(screen.getByRole('button', { name: rotulo }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    expect(api[funcao]).toHaveBeenCalledWith(...args);
  });

  it('marca o botão ativo com aria-pressed', () => {
    renderizar({ watched: true });

    expect(screen.getByRole('button', { name: 'Assistido' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Quero assistir' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('avalia com a estrela clicada', async () => {
    const { onChanged } = renderizar();

    await userEvent.click(screen.getByRole('radio', { name: '4 estrelas' }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(api.avaliarFilme).toHaveBeenCalledWith(603, 4);
  });

  it('remove a nota ao clicar na mesma estrela', async () => {
    const { onChanged } = renderizar({ rating: 4 });

    await userEvent.click(screen.getByRole('radio', { name: '4 estrelas' }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(api.removerAvaliacao).toHaveBeenCalledWith(603);
    expect(api.avaliarFilme).not.toHaveBeenCalled();
  });

  it('mostra o erro da API e não recarrega', async () => {
    api.marcarAssistido.mockRejectedValue(new ApiError(400, 'Algo deu errado.'));
    const { onChanged } = renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Assistido' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Algo deu errado.');
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('abre a escolha de lista', async () => {
    const { onAddToList } = renderizar();

    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar a uma lista' }),
    );

    expect(onAddToList).toHaveBeenCalledOnce();
  });
});
