import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Paginacao,
  PosterCard,
  PosterGrid,
  PosterGridSkeleton,
} from '../components/ui';
import { buscarFilmes } from '../api/movies';
import { useAsync } from '../lib/useAsync';
import { anoDe, imagemTmdb, notaEm5 } from '../lib/tmdbImage';

const SEM_BUSCA = Promise.resolve(null);

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const pagina = Math.max(1, Number(params.get('page')) || 1);
  const [termo, setTermo] = useState(q);

  // A busca do topo muda a URL; o campo da página acompanha.
  useEffect(() => setTermo(q), [q]);

  const { data, error, loading, recarregar } = useAsync(
    () => (q ? buscarFilmes({ q, page: pagina }) : SEM_BUSCA),
    [q, pagina],
  );

  function buscar(e) {
    e.preventDefault();
    const novo = termo.trim();
    if (novo) setParams({ q: novo });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black">Busca</h1>

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

      {!q && (
        <EmptyState
          title="O que você quer assistir?"
          description="Digite o título de um filme para começar."
        />
      )}

      {q && error && <ErrorState error={error} onRetry={recarregar} />}
      {q && loading && !data && <PosterGridSkeleton count={10} />}

      {q && data && (
        <>
          <p className="text-sm text-muted">
            {data.total_results} resultados para “{q}”
          </p>

          {data.results.length === 0 ? (
            <EmptyState
              title="Nada encontrado"
              description="Tente outro título ou confira a grafia."
            />
          ) : (
            <PosterGrid aria-label="Resultados da busca">
              {data.results.map((filme) => (
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

          <Paginacao
            pagina={data.page}
            temAnterior={data.page > 1}
            temProxima={data.page < Math.min(data.total_pages, 500)}
            onChange={(novaPagina) => setParams({ q, page: String(novaPagina) })}
          />
        </>
      )}
    </div>
  );
}
