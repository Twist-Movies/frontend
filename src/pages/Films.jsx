import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  PosterCard,
  PosterGrid,
  PosterGridSkeleton,
} from '../components/ui';
import { FilmeLinha } from '../components/ui/FilmeLinha';
import { FiltrosFilmes } from '../components/film/FiltrosFilmes';
import { descobrirFilmes } from '../api/discover';
import { buscarFilmes } from '../api/movies';
import {
  FILTROS_VAZIOS,
  aplicarFiltrosLocais,
  filtrosDaUrl,
  paraApi,
  paraUrl,
  temFiltros,
} from '../lib/filtrosFilmes';
import { cx } from '../lib/cx';
import { anoDe, imagemTmdb, notaEm5 } from '../lib/tmdbImage';
import { useListaInfinita } from '../lib/useListaInfinita';

const SEM_RESULTADOS = { results: [], total_pages: 0 };
const CHAVE_VISAO = 'twist:filmes:visao';

function lerVisao() {
  try {
    return localStorage.getItem(CHAVE_VISAO) === 'lista' ? 'lista' : 'grade';
  } catch {
    return 'grade';
  }
}

function gravarVisao(visao) {
  try {
    localStorage.setItem(CHAVE_VISAO, visao);
  } catch {
    // Sem armazenamento: a escolha vale só nesta sessão.
  }
}

function AlternarVisao({ visao, onChange }) {
  const botao = (id, rotulo, Icone) => (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={visao === id}
      onClick={() => onChange(id)}
      className={cx(
        'flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors',
        visao === id ? 'bg-surface-hover text-fg' : 'text-muted hover:text-fg',
      )}
    >
      <Icone size={18} aria-hidden="true" />
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Modo de exibição"
      className="flex rounded-lg border border-line bg-surface-2 p-0.5"
    >
      {botao('grade', 'Ver em grade', LayoutGrid)}
      {botao('lista', 'Ver em lista', List)}
    </div>
  );
}

export default function Films() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(() => filtrosDaUrl(params), [params]);
  const [catalogo, setCatalogo] = useState(true);
  const [termo, setTermo] = useState(filtros.q);
  const [visao, setVisao] = useState(lerVisao);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const mudarVisao = (nova) => {
    setVisao(nova);
    gravarVisao(nova);
  };

  // Com catálogo, qualquer filtro refaz a consulta no servidor. Sem ele, só o
  // título consulta; o resto é aplicado aqui, sobre o que já foi carregado.
  const chaveDaFonte = catalogo ? paraUrl(filtros).toString() : filtros.q;

  const lista = useListaInfinita(
    (page) => {
      if (catalogo) return descobrirFilmes({ page, ...paraApi(filtros) });
      if (!filtros.q) return Promise.resolve(SEM_RESULTADOS);
      return buscarFilmes({ q: filtros.q, page });
    },
    [catalogo, chaveDaFonte],
  );

  // Rota de catálogo ausente no back (404): cai para o modo de busca. Nenhuma
  // outra consulta desta tela devolve 404, então ele nunca é mostrado como erro.
  const erro404 = lista.erro?.status === 404;
  const semCatalogo = catalogo && erro404;
  useEffect(() => {
    if (semCatalogo) setCatalogo(false);
  }, [semCatalogo]);

  useEffect(() => setTermo(filtros.q), [filtros.q]);

  const filmes = useMemo(() => {
    const unicos = [
      ...new Map(lista.itens.map((f) => [f.tmdb_id, f])).values(),
    ];
    return catalogo ? unicos : aplicarFiltrosLocais(unicos, filtros);
  }, [lista.itens, catalogo, filtros]);

  const alterar = (campo, valor) =>
    setParams(paraUrl({ ...filtros, [campo]: valor }), { replace: true });
  const limpar = () =>
    setParams(paraUrl({ ...FILTROS_VAZIOS, q: filtros.q }), { replace: true });

  function buscar(e) {
    e.preventDefault();
    setParams(paraUrl({ ...filtros, q: termo.trim() }), { replace: true });
  }

  const carregandoTudo = lista.primeiraCarga || semCatalogo;
  const erroFatal = lista.erro && !erro404 && lista.itens.length === 0;
  const precisaDeTitulo = !catalogo && !filtros.q;

  let conteudo;
  if (erroFatal) {
    conteudo = <ErrorState error={lista.erro} onRetry={lista.repetir} />;
  } else if (carregandoTudo) {
    conteudo = <PosterGridSkeleton count={12} />;
  } else if (precisaDeTitulo) {
    conteudo = (
      <EmptyState
        title="Pesquise um título"
        description="Digite o nome de um filme para explorar e refinar por década, nota e ordenação."
      />
    );
  } else if (filmes.length === 0 && !lista.temMais) {
    conteudo = (
      <EmptyState
        title="Nenhum filme encontrado"
        description="Tente ajustar ou limpar os filtros."
      />
    );
  } else {
    conteudo = (
      <>
        {filmes.length > 0 && visao === 'grade' && (
          <PosterGrid aria-label="Filmes">
            {filmes.map((filme) => (
              <PosterCard
                key={filme.tmdb_id}
                id={filme.tmdb_id}
                title={filme.title}
                year={anoDe(filme.release_date)}
                posterUrl={imagemTmdb(filme.poster_path)}
                rating={notaEm5(filme.tmdb_rating_average)}
              />
            ))}
          </PosterGrid>
        )}

        {filmes.length > 0 && visao === 'lista' && (
          <ul aria-label="Filmes" className="flex flex-col gap-3">
            {filmes.map((filme) => (
              <li key={filme.tmdb_id}>
                <FilmeLinha
                  id={filme.tmdb_id}
                  title={filme.title}
                  year={anoDe(filme.release_date)}
                  posterUrl={imagemTmdb(filme.poster_path)}
                  rating={notaEm5(filme.tmdb_rating_average)}
                  overview={filme.overview}
                />
              </li>
            ))}
          </ul>
        )}

        <div ref={lista.sentinelaRef} aria-hidden="true" />

        {lista.carregando && (
          <p role="status" className="text-center text-sm text-muted">
            Carregando mais filmes…
          </p>
        )}
        {lista.erro && !erro404 && (
          <ErrorState error={lista.erro} onRetry={lista.repetir} />
        )}
        {!lista.carregando && !lista.erro && lista.temMais && (
          <div className="text-center">
            <Button variant="ghost" onClick={lista.carregarMais}>
              Carregar mais
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Filmes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-expanded={filtrosAbertos}
            aria-controls="filtros-filmes"
            onClick={() => setFiltrosAbertos((a) => !a)}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filtros
          </Button>
          <AlternarVisao visao={visao} onChange={mudarVisao} />
        </div>
      </div>

      {!catalogo && (
        <>
          <p className="text-sm text-muted">
            O catálogo completo, com filtro por gênero e duração e ordenação por
            popularidade, depende de uma rota do back-end. Por enquanto,
            pesquise um título e refine por década, nota e ordenação.
          </p>
          <form role="search" className="flex gap-2" onSubmit={buscar}>
            <Input
              type="search"
              aria-label="Título do filme"
              placeholder="Pesquise um filme pelo título"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </form>
        </>
      )}

      {/* No mobile os filtros ficam recolhidos atrás do botão "Filtros". */}
      <div
        id="filtros-filmes"
        className={cx(filtrosAbertos ? 'block' : 'hidden', 'md:block')}
      >
        <FiltrosFilmes
          filtros={filtros}
          catalogo={catalogo}
          podeLimpar={temFiltros(filtros)}
          onChange={alterar}
          onLimpar={limpar}
        />
      </div>

      {conteudo}
    </div>
  );
}
