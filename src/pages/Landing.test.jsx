import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/utils';
import { ApiError } from '../api/errors';
import { buscarFilmes } from '../api/movies';
import { VITRINE } from '../lib/vitrine';
import Landing from './Landing';

vi.mock('../api/movies', () => ({ buscarFilmes: vi.fn() }));

function respostasPadrao() {
  buscarFilmes.mockImplementation(async ({ q }) => {
    const i = VITRINE.findIndex(({ titulo }) => titulo === q);
    return {
      results: [
        {
          tmdb_id: 100 + i,
          title: VITRINE[i].titulo,
          release_date: `${VITRINE[i].ano}-05-01`,
          poster_path: '/p.jpg',
          tmdb_rating_average: 8,
        },
      ],
    };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  respostasPadrao();
});

describe('Landing', () => {
  it('apresenta a proposta do produto', () => {
    renderWithRouter(<Landing />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Descubra. Avalie. Compartilhe.',
      }),
    ).toBeInTheDocument();
  });

  it('leva ao cadastro e à vitrine de filmes', () => {
    renderWithRouter(<Landing />);

    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
    expect(
      screen.getByRole('link', { name: 'Explorar filmes' }),
    ).toHaveAttribute('href', '#filmes');
  });

  it('mostra a vitrine carregando antes dos filmes chegarem', () => {
    renderWithRouter(<Landing />);

    expect(screen.getByLabelText('Filmes populares')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('mostra ao visitante os filmes vindos da API', async () => {
    renderWithRouter(<Landing />);

    const cidade = await screen.findByRole('link', {
      name: 'Cidade de Deus (2002)',
    });
    const vitrine = screen.getByLabelText('Filmes populares');
    expect(within(vitrine).getAllByRole('link')).toHaveLength(VITRINE.length);
    expect(cidade).toHaveAttribute('href', '/filme/100');
    expect(buscarFilmes).toHaveBeenCalledTimes(VITRINE.length);
  });

  it('mostra erro com nova tentativa quando a API não responde', async () => {
    buscarFilmes.mockRejectedValue(new ApiError(0, 'Sem conexão.'));
    renderWithRouter(<Landing />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os filmes agora.',
    );

    respostasPadrao();
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(
      await screen.findByRole('link', { name: 'Cidade de Deus (2002)' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('avisa quando a busca não devolve nenhum filme', async () => {
    buscarFilmes.mockResolvedValue({ results: [] });
    renderWithRouter(<Landing />);

    expect(
      await screen.findByText('Nenhum filme disponível no momento.'),
    ).toBeInTheDocument();
  });

  it('não mostra séries enquanto a funcionalidade está em espera', async () => {
    renderWithRouter(<Landing />);

    await waitFor(() => expect(buscarFilmes).toHaveBeenCalled());
    expect(screen.queryByLabelText('Séries populares')).not.toBeInTheDocument();
  });

  it('rola até a seção pedida na âncora do endereço', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    renderWithRouter(<Landing />, { route: '/boas-vindas#sobre' });

    expect(scrollIntoView).toHaveBeenCalledOnce();
    await screen.findByRole('link', { name: 'Cidade de Deus (2002)' });
    delete Element.prototype.scrollIntoView;
  });
});
