import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Card,
  ErrorState,
  SectionTitle,
  Skeleton,
  StarRating,
} from '../components/ui';
import { AddToPlaylistModal } from '../components/film/AddToPlaylistModal';
import { ClassificacaoIndicativa } from '../components/film/ClassificacaoIndicativa';
import { Elenco } from '../components/film/Elenco';
import { Equipe } from '../components/film/Equipe';
import { FilmActions } from '../components/film/FilmActions';
import { FilmesSemelhantes } from '../components/film/FilmesSemelhantes';
import { ImagemAmpliavel } from '../components/film/ImagemAmpliavel';
import { PessoaModal } from '../components/film/PessoaModal';
import { ReviewsSection } from '../components/film/ReviewsSection';
import { Trailer } from '../components/film/Trailer';
import { detalheDoFilme } from '../api/movies';
import { generosComId } from '../lib/filme';
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
  const [posterAberto, setPosterAberto] = useState(false);
  const [pessoa, setPessoa] = useState(null);
  const {
    data: filme,
    error,
    loading,
    recarregar,
  } = useAsync(() => detalheDoFilme(filmId), [filmId]);

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!filme) return loading ? <Carregando /> : null;

  const ano = anoDe(filme.release_date);
  const cast = filme.cast ?? [];
  const crew = filme.crew ?? [];
  const diretores = crew.filter((p) => p.job === 'Director');
  const meta = [ano, duracao(filme.runtime_minutes)]
    .filter(Boolean)
    .join(' · ');
  const poster = imagemTmdb(filme.poster_path);
  const posterGrande = imagemTmdb(filme.poster_path, 'w780');
  const generos = generosComId(filme);
  const stats = filme.stats;
  const aprovacao = stats.approval_percent;
  const abrirPessoa = (p) => setPessoa({ id: p.id, name: p.name });

  return (
    <div className="flex flex-col gap-10">
      <Trailer
        chave={filme.trailer}
        backdrop={filme.backdrop_path}
        titulo={filme.title}
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="aspect-2/3 w-40 overflow-hidden rounded-lg border border-line bg-surface-2 md:w-full">
          {poster && (
            <button
              type="button"
              aria-label="Ampliar pôster"
              onClick={() => setPosterAberto(true)}
              className="size-full cursor-zoom-in border-0 bg-transparent p-0"
            >
              <img
                src={poster}
                alt={`Pôster de ${filme.title}`}
                className="size-full object-cover"
              />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-black">{filme.title}</h1>
            {filme.original_title && filme.original_title !== filme.title && (
              <p className="text-sm text-faint">{filme.original_title}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-muted">
              {meta && <p>{meta}</p>}
              <ClassificacaoIndicativa valor={filme.certification} />
            </div>
            {diretores.length > 0 && (
              <p className="text-muted">
                Direção de{' '}
                {diretores.map((d, i) => (
                  <span key={d.id ?? d.name}>
                    {d.id ? (
                      <button
                        type="button"
                        onClick={() => abrirPessoa(d)}
                        className="cursor-pointer font-semibold text-fg hover:underline"
                      >
                        {d.name}
                      </button>
                    ) : (
                      <span className="font-semibold text-fg">{d.name}</span>
                    )}
                    {i < diretores.length - 1 && ', '}
                  </span>
                ))}
              </p>
            )}
          </div>

          {generos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {generos.map((genero) =>
                genero.id ? (
                  <Link
                    key={genero.nome}
                    to={`/filmes?genero=${genero.id}`}
                    className="rounded-full hover:opacity-80"
                  >
                    <Badge>{genero.nome}</Badge>
                  </Link>
                ) : (
                  <Badge key={genero.nome}>{genero.nome}</Badge>
                ),
              )}
            </div>
          )}

          {filme.overview && <p className="max-w-prose">{filme.overview}</p>}
        </div>
      </div>

      <section aria-label="Avaliação e ações" className="flex flex-col gap-6">
        <Card>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
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
        </Card>

        {filme.user_state && (
          <FilmActions
            tmdbId={filme.tmdb_id}
            estado={filme.user_state}
            onChanged={recarregar}
            onAddToList={() => setListaAberta(true)}
          />
        )}
      </section>

      <section aria-label="Aprovação" data-testid="aprovacao">
        <SectionTitle>Aprovação</SectionTitle>
        {typeof aprovacao === 'number' ? (
          <p>
            <span className="text-2xl font-black">
              {aprovacao}% de aprovação
            </span>{' '}
            <span className="text-sm text-muted">
              ({stats.approval_votes ?? 0}{' '}
              {stats.approval_votes === 1 ? 'voto' : 'votos'})
            </span>
          </p>
        ) : (
          <p className="text-muted">Ainda sem votos suficientes</p>
        )}
      </section>

      {cast.length > 0 && (
        <section aria-label="Elenco">
          <SectionTitle>Elenco</SectionTitle>
          <Elenco elenco={cast} onSelecionar={abrirPessoa} />
        </section>
      )}

      {crew.length > 0 && (
        <section aria-label="Equipe técnica">
          <SectionTitle>Equipe técnica</SectionTitle>
          <Equipe equipe={crew} onSelecionar={abrirPessoa} />
        </section>
      )}

      <div id="comentários" className="scroll-mt-20">
        <ReviewsSection tmdbId={filme.tmdb_id} />
      </div>

      <FilmesSemelhantes tmdbId={filme.tmdb_id} />

      <AddToPlaylistModal
        open={listaAberta}
        tmdbId={filme.tmdb_id}
        onClose={() => setListaAberta(false)}
      />
      <ImagemAmpliavel
        open={posterAberto}
        src={posterGrande}
        alt={`Pôster de ${filme.title}`}
        onClose={() => setPosterAberto(false)}
      />
      <PessoaModal pessoa={pessoa} onClose={() => setPessoa(null)} />
    </div>
  );
}
