import { PosterCard, PosterGrid, SectionTitle } from '../ui';
import { filmesRecomendados } from '../../api/movies';
import { useAsync } from '../../lib/useAsync';
import { anoDe, imagemTmdb, notaEm5 } from '../../lib/tmdbImage';

// Carrega por conta própria; some se estiver vazio ou der erro.
export function FilmesSemelhantes({ tmdbId }) {
  const { data } = useAsync(() => filmesRecomendados(tmdbId), [tmdbId]);
  const filmes = data?.results ?? [];
  if (filmes.length === 0) return null;

  return (
    <section aria-label="Filmes semelhantes">
      <SectionTitle>
        Se você gostou deste filme, talvez goste destes
      </SectionTitle>
      <PosterGrid>
        {filmes.slice(0, 12).map((filme) => (
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
    </section>
  );
}
