import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  PosterCard,
  PosterGrid,
  PosterGridSkeleton,
} from '../components/ui';
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
import { anoDe, imagemTmdb, notaEm5 } from '../lib/tmdbImage';
import { useListaInfinita } from '../lib/useListaInfinita';

const SEM_RESULTADOS = { results: [], total_pages: 0 };

export default function Films() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(() => filtrosDaUrl(params), [params]);
  const [catalogo, setCatalogo] = useState(true);
  const [termo, setTermo] = useState(filtros.q);

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
    const unicos = [...new Map(lista.itens.map((f) => [f.tmdb_id, f])).values()];
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
        {filmes.length > 0 && (
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
      <h1 className="text-3xl font-black">Filmes</h1>

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

      <FiltrosFilmes
        filtros={filtros}
        catalogo={catalogo}
        podeLimpar={temFiltros(filtros)}
        onChange={alterar}
        onLimpar={limpar}
      />

      {conteudo}
    </div>
  );
}
