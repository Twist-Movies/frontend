import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/utils';
import { curtirResenha, descurtirResenha } from '../../api/reviews';
import { ReviewItem } from './ReviewItem';

vi.mock('../../api/reviews', () => ({
  curtirResenha: vi.fn(),
  descurtirResenha: vi.fn(),
}));

const REVIEW = {
  id: 1,
  author: { id: 2, username: 'ana', avatar_url: null },
  content: 'Muito bom',
  contains_spoiler: false,
  likes_count: 2,
  liked_by_me: false,
  created_at: '2026-10-20T15:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  curtirResenha.mockResolvedValue({});
  descurtirResenha.mockResolvedValue(null);
});

describe('ReviewItem', () => {
  it('mostra autor, texto e link para a resenha', () => {
    renderWithRouter(<ReviewItem review={REVIEW} onChange={vi.fn()} />);

    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('Muito bom')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '20/10/2026' })).toHaveAttribute(
      'href',
      '/resenha/1',
    );
  });

  it('esconde resenhas com spoiler até o leitor pedir', async () => {
    renderWithRouter(
      <ReviewItem review={{ ...REVIEW, contains_spoiler: true }} onChange={vi.fn()} />,
    );

    expect(screen.queryByText('Muito bom')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Mostrar mesmo assim' }),
    );
    expect(screen.getByText('Muito bom')).toBeInTheDocument();
  });

  it('curte e atualiza o contador', async () => {
    const onChange = vi.fn();
    renderWithRouter(<ReviewItem review={REVIEW} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Curtir/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(curtirResenha).toHaveBeenCalledWith(1);
    expect(onChange).toHaveBeenCalledWith({
      ...REVIEW,
      liked_by_me: true,
      likes_count: 3,
    });
  });

  it('descurte quando já estava curtida', async () => {
    const onChange = vi.fn();
    renderWithRouter(
      <ReviewItem review={{ ...REVIEW, liked_by_me: true }} onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Curtida/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(descurtirResenha).toHaveBeenCalledWith(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      liked_by_me: false,
      likes_count: 1,
    });
  });

  it('não altera nada quando a curtida falha', async () => {
    curtirResenha.mockRejectedValue(new Error('x'));
    const onChange = vi.fn();
    renderWithRouter(<ReviewItem review={REVIEW} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Curtir/ }));

    await waitFor(() => expect(curtirResenha).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });
});
