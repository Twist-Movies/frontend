import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/utils';
import { ApiError } from '../../api/errors';
import { detalheDaPessoa } from '../../api/movies';
import { ClassificacaoIndicativa } from './ClassificacaoIndicativa';
import { Elenco } from './Elenco';
import { Equipe } from './Equipe';
import { ImagemAmpliavel } from './ImagemAmpliavel';
import { PessoaModal } from './PessoaModal';
import { Trailer } from './Trailer';

vi.mock('../../api/movies', () => ({
  detalheDaPessoa: vi.fn(),
  filmesRecomendados: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe('ClassificacaoIndicativa', () => {
  it('mostra o selo com texto acessível', () => {
    render(<ClassificacaoIndicativa valor="12" />);

    expect(
      screen.getByRole('img', { name: 'Classificação indicativa: 12 anos' }),
    ).toHaveAttribute('data-classificacao', '12');
  });

  it('não mostra selo para valores não mapeados', () => {
    const { container } = render(<ClassificacaoIndicativa valor="PG-13" />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('Trailer', () => {
  it('não renderiza sem trailer nem backdrop', () => {
    const { container } = render(<Trailer titulo="X" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra só o backdrop quando não há trailer', () => {
    const { container } = render(<Trailer backdrop="/b.jpg" titulo="X" />);

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w1280/b.jpg',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('troca o banner pelo iframe ao clicar', async () => {
    render(<Trailer chave="k1" backdrop="/b.jpg" titulo="X" />);

    await userEvent.click(screen.getByRole('button', { name: /trailer de X/ }));

    expect(screen.getByTitle('Trailer de X')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/k1?autoplay=1',
    );
  });

  it('funciona só com a chave, sem backdrop', () => {
    render(<Trailer chave="k1" titulo="X" />);

    expect(
      screen.getByRole('button', { name: /trailer de X/ }),
    ).toBeInTheDocument();
  });
});

describe('ImagemAmpliavel', () => {
  it('não renderiza fechada', () => {
    render(
      <ImagemAmpliavel
        open={false}
        src="/a.jpg"
        alt="Foto"
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fecha com Esc, clique fora e botão, e bloqueia o scroll', async () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ImagemAmpliavel open src="/a.jpg" alt="Foto" onClose={onClose} />,
    );
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: screen.getByTestId('imagem-ampliada-fundo'),
    });
    expect(onClose).toHaveBeenCalledTimes(3);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();

    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

describe('Elenco', () => {
  const elenco = [
    { id: 1, name: 'Ana', character: 'A', profile_path: '/a.jpg' },
    { id: 2, name: 'Bia', character: 'B', profile_path: null },
    { id: 3, name: 'Caio', character: 'C', profile_path: null },
    { id: 4, name: 'Davi', character: 'D', profile_path: null },
  ];

  it('mostra os 3 principais e expande o resto', async () => {
    const { container } = render(<Elenco elenco={elenco} />);

    expect(screen.queryByText('Davi')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w185/a.jpg',
    );
    expect(
      screen.getByText('B', { selector: 'span[aria-hidden]' }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver elenco completo' }),
    );
    expect(screen.getByText('Davi')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Mostrar menos' }),
    );
    expect(screen.queryByText('Davi')).toBeNull();
  });

  it('não oferece expandir com poucos nomes e aceita lista vazia', () => {
    const { rerender, container } = render(
      <Elenco elenco={elenco.slice(0, 2)} />,
    );
    expect(
      screen.queryByRole('button', { name: 'Ver elenco completo' }),
    ).toBeNull();

    rerender(<Elenco elenco={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('seleciona a pessoa ao clicar', async () => {
    const onSelecionar = vi.fn();
    render(<Elenco elenco={elenco} onSelecionar={onSelecionar} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalhes de Ana' }),
    );

    expect(onSelecionar).toHaveBeenCalledWith(elenco[0]);
  });
});

describe('Equipe', () => {
  const equipe = [
    { id: 1, name: 'Lana', job: 'Director' },
    { id: 1, name: 'Lana', job: 'Director' },
    { id: 2, name: 'Joel', job: 'Producer' },
    { name: 'Sem Id', job: 'Original Music Composer' },
    { id: 4, name: 'Outro', job: 'Gaffer' },
  ];

  it('agrupa por função traduzida e sem duplicar', () => {
    render(<Equipe equipe={equipe} />);

    expect(screen.getByText('Direção')).toBeInTheDocument();
    expect(screen.getByText('Música')).toBeInTheDocument();
    expect(screen.getByText('Produção')).toBeInTheDocument();
    expect(screen.getAllByText('Lana')).toHaveLength(1);
    expect(screen.queryByText('Outro')).toBeNull();
  });

  it('torna clicáveis só nomes com id', async () => {
    const onSelecionar = vi.fn();
    render(<Equipe equipe={equipe} onSelecionar={onSelecionar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Lana' }));

    expect(onSelecionar).toHaveBeenCalledWith(equipe[0]);
    expect(screen.queryByRole('button', { name: 'Sem Id' })).toBeNull();
  });

  it('não renderiza sem equipe', () => {
    const { container } = render(<Equipe />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('PessoaModal', () => {
  const bioLonga = 'Texto. '.repeat(100);

  it('não renderiza sem pessoa', () => {
    const { container } = renderWithRouter(
      <PessoaModal pessoa={null} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra skeleton, depois foto, bio truncada e filmes', async () => {
    detalheDaPessoa.mockResolvedValue({
      id: 7,
      name: 'Ana Souza',
      biography: bioLonga,
      birthday: '1970-01-01',
      known_for_department: 'Acting',
      profile_path: '/p.jpg',
      movies: [
        {
          tmdb_id: 10,
          title: 'Filme A',
          poster_path: '/f.jpg',
          release_date: '2001-01-01',
        },
        { tmdb_id: 11, title: 'Filme B', poster_path: null },
      ],
    });
    renderWithRouter(
      <PessoaModal pessoa={{ id: 7, name: 'Ana Souza' }} onClose={vi.fn()} />,
    );

    expect(screen.getByTestId('pessoa-carregando')).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'Foto de Ana Souza' }),
    ).toBeInTheDocument();
    expect(detalheDaPessoa).toHaveBeenCalledWith(7);
    expect(
      screen.getByRole('link', { name: 'Filme A (2001)' }),
    ).toHaveAttribute('href', '/filme/10');
    expect(screen.getByRole('link', { name: 'Filme B' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ler mais' }));
    expect(
      screen.getByRole('button', { name: 'ler menos' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ler menos' }));
    expect(
      screen.getByRole('button', { name: 'ler mais' }),
    ).toBeInTheDocument();
  });

  it('tolera ausência de foto, bio e filmes', async () => {
    detalheDaPessoa.mockResolvedValue({ id: 7, name: 'Ana Souza' });
    renderWithRouter(
      <PessoaModal pessoa={{ id: 7, name: 'Ana Souza' }} onClose={vi.fn()} />,
    );

    expect(
      await screen.findByText('Biografia não disponível.'),
    ).toBeInTheDocument();
  });

  it('mostra o erro e tenta de novo', async () => {
    detalheDaPessoa.mockRejectedValueOnce(new ApiError(503, 'Fora do ar.'));
    detalheDaPessoa.mockResolvedValueOnce({
      id: 7,
      name: 'Ana Souza',
      biography: 'Ok.',
    });
    renderWithRouter(
      <PessoaModal pessoa={{ id: 7, name: 'Ana Souza' }} onClose={vi.fn()} />,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Fora do ar.');
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    await waitFor(() => expect(screen.getByText('Ok.')).toBeInTheDocument());
  });
});
