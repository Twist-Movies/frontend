import { PosterCard } from './PosterCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './Carousel';
import { SectionTitle } from './SectionTitle';
import { anoDe, imagemTmdb, notaEm5 } from '../../lib/tmdbImage';

const LARGURA = 'w-32 sm:w-36 lg:w-40';

// Fileira de pôsteres em carrossel (home): setas no desktop, arrastar/deslizar no toque.
export function PosterRow({ title, filmes, action }) {
  return (
    <section aria-label={title}>
      <SectionTitle action={action}>{title}</SectionTitle>
      <Carousel aria-label={`Carrossel: ${title}`}>
        <CarouselContent>
          {filmes.map((filme) => (
            <CarouselItem key={filme.tmdb_id} className={LARGURA}>
              <PosterCard
                id={filme.tmdb_id}
                title={filme.title}
                year={anoDe(filme.release_date)}
                posterUrl={imagemTmdb(filme.poster_path)}
                rating={notaEm5(filme.tmdb_rating_average)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}

export function PosterRowSkeleton({ title }) {
  return (
    <section aria-label={title} aria-busy="true">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex gap-3 overflow-hidden pt-1 pb-1 sm:gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`${LARGURA} flex flex-col gap-2`}>
            <span className="block aspect-2/3 animate-pulse-soft rounded-lg bg-surface-2 motion-reduce:animate-none" />
            <span className="block h-3 w-4/5 animate-pulse-soft rounded-md bg-surface-2 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
