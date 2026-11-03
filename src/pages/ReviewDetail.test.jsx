import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithAuth } from '../test/utils';
import { editarResenha, excluirResenha, obterResenha } from '../api/reviews';
import ReviewDetail from './ReviewDetail';

vi.mock('../api/reviews', () => ({
  obterResenha: vi.fn(),
  editarResenha: vi.fn(),
  excluirResenha: vi.fn(),
  curtirResenha: vi.fn(),
  descurtirResenha: vi.fn(),
}));

const REVIEW = {
  id: 5,
  movie: {
    id: 1,
    tmdb_id: 603,
    title: 'Matrix',
    original_title: 'The Matrix',
    poster_path: null,
    release_date: '1999-03-30',
  },
  author: { id: 4, username: 'davi', avatar_url: null },
  content: 'Gostei muito',
  contains_spoiler: false,
  likes_count: 1,
  liked_by_me: false,
  created_at: '2026-10-20T15:00:00Z',
  updated_at: '2026-10-20T15:00:00Z',
};

function renderizar(sessao) {
  renderWithAuth(
    <Routes>
      <Route path="/resenha/:reviewId" element={<ReviewDetail />} />
      <Route path="/filme/:filmId" element={<p>página do filme</p>} />
    </Routes>,
    { route: '/resenha/5', ...(sessao ? { session: sessao } : {}) },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  obterResenha.mockResolvedValue(REVIEW);
});

describe('ReviewDetail', () => {
  it('mostra a resenha e o filme', async () => {
    renderizar();

    expect(await screen.findByText('Gostei muito')).toBeInTheDocument();
    expect(obterResenha).toHaveBeenCalledWith('5');
    expect(screen.getByRole('link', { name: 'Matrix' })).toHaveAttribute(
      'href',
      '/filme/603',
    );
  });

  it('só oferece editar e excluir ao autor', async () => {
    renderizar({ username: 'outra', displayName: 'Outra' });

    await screen.findByText('Gostei muito');
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });

  it('edita a resenha', async () => {
    editarResenha.mockResolvedValue({ ...REVIEW, content: 'Adorei' });
    renderizar();
    await screen.findByText('Gostei muito');

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const campo = screen.getByLabelText('Editar resenha');
    await userEvent.clear(campo);
    await userEvent.type(campo, 'Adorei');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Adorei')).toBeInTheDocument();
    expect(editarResenha).toHaveBeenCalledWith(5, {
      content: 'Adorei',
      containsSpoiler: false,
    });
  });

  it('exclui a resenha e volta para o filme', async () => {
    excluirResenha.mockResolvedValue(null);
    renderizar();
    await screen.findByText('Gostei muito');

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Excluir' })[1]);

    expect(await screen.findByText('página do filme')).toBeInTheDocument();
    expect(excluirResenha).toHaveBeenCalledWith(5);
  });
});
