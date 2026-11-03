import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Card, ErrorState, SectionTitle, Skeleton, StarRating } from '../components/ui';
import { AddToPlaylistModal } from '../components/film/AddToPlaylistModal';
import { FilmActions } from '../components/film/FilmActions';
import { ReviewsSection } from '../components/film/ReviewsSection';
import { detalheDoFilme } from '../api/movies';
import { useAsync } from '../lib/useAsync';
import { anoDe, duracao, imagemTmdb, notaEm5 } from '../lib/tmdbImage';

function Carregando() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton height={36} width="50%" />
      <Skeleton height={200} />
    </div>
  );
}

function Estatistica({ rotulo, valor }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-black">{valor}</span>
      <span className="text-xs tracking-wider text-muted uppercase">
        {rotulo}
      </span>
    </div>
  );
}

export default function FilmDetail() {
  const { filmId } = useParams();
  const [listaAberta, setListaAberta] = useState(false);
  const { data: filme, error, loading, recarregar } = useAsync(
    () => detalheDoFilme(filmId),
    [filmId],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!filme) return loading ? <Carregando /> : null;

  const ano = anoDe(filme.release_date);
  const diretores = filme.crew
    .filter((pessoa) => pessoa.job === 'Director')
    .map((pessoa) => pessoa.name);
  const meta = [ano, duracao(filme.runtime_minutes), filme.certification]
    .filter(Boolean)
    .join(' · ');
  const poster = imagemTmdb(filme.poster_path);
  const stats = filme.stats;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="aspect-2/3 w-40 overflow-hidden rounded-lg border border-line bg-surface-2 md:w-full">
          {poster && (
            <img
              src={poster}
              alt={`Pôster de ${filme.title}`}
              className="size-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-black">{filme.title}</h1>
            {filme.original_title && filme.original_title !== filme.title && (
              <p className="text-sm text-faint">{filme.original_title}</p>
            )}
            {meta && <p className="mt-1 text-muted">{meta}</p>}
            {diretores.length > 0 && (
              <p className="text-muted">
                Direção de{' '}
                <span className="font-semibold text-fg">
                  {diretores.join(', ')}
                </span>
              </p>
            )}
          </div>

          {filme.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filme.genres.map((genero) => (
                <Badge key={genero}>{genero}</Badge>
              ))}
            </div>
          )}

          {filme.overview && <p className="max-w-prose">{filme.overview}</p>}

          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Estatistica rotulo="Assistiram" valor={stats.watched_count} />
              <Estatistica rotulo="Curtidas" valor={stats.likes_count} />
              <div className="flex flex-col gap-1">
                {stats.rating_average !== null ? (
                  <>
                    <StarRating
                      value={Math.round(stats.rating_average * 2) / 2}
                      label={`Nota média ${stats.rating_average} de 5`}
                    />
                    <span className="text-xs text-muted">
                      {stats.rating_average} · {stats.rating_count} avaliações no
                      Twist
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted">
                    Ainda sem avaliações no Twist
                  </span>
                )}
              </div>
              {notaEm5(filme.tmdb_rating_average) !== undefined && (
                <span className="text-xs text-faint">
                  TMDB: {filme.tmdb_rating_average.toFixed(1)}/10
                </span>
              )}
            </div>

            {filme.user_state && (
              <FilmActions
                tmdbId={filme.tmdb_id}
                estado={filme.user_state}
                onChanged={recarregar}
                onAddToList={() => setListaAberta(true)}
              />
            )}
          </Card>
        </div>
      </div>

      {filme.cast.length > 0 && (
        <section aria-label="Elenco">
          <SectionTitle>Elenco</SectionTitle>
          <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {filme.cast.map((pessoa) => (
              <li key={`${pessoa.name}-${pessoa.character}`}>
                <span className="font-semibold">{pessoa.name}</span>
                {pessoa.character && (
                  <span className="text-muted"> · {pessoa.character}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReviewsSection tmdbId={filme.tmdb_id} />

      <AddToPlaylistModal
        open={listaAberta}
        tmdbId={filme.tmdb_id}
        onClose={() => setListaAberta(false)}
      />
    </div>
  );
}
