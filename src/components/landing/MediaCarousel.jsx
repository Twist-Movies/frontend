import { ErrorState, PosterCard, Skeleton } from '../ui';

function MediaCarousel({
  id,
  label,
  title,
  items,
  kind = 'filme',
  yearOf,
  status = 'ready',
  onRetry,
}) {
  return (
    <section id={id} className="bg-bg px-5 py-18 sm:px-[5%] sm:py-25">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2.5 text-xs font-bold tracking-[3px] opacity-60">
            {label}
          </p>
          <h2 className="text-3xl font-bold sm:text-[40px]">{title}</h2>
        </div>
      </div>

      {status === 'error' && (
        <ErrorState
          error={new Error('Não foi possível carregar os filmes agora.')}
          onRetry={onRetry}
        />
      )}

      {status === 'ready' && items.length === 0 && (
        <p className="text-muted">Nenhum filme disponível no momento.</p>
      )}

      {status === 'loading' && (
        <div
          aria-label={title}
          aria-busy="true"
          className="flex gap-5 overflow-hidden pb-4"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex flex-[0_0_170px] flex-col gap-2 sm:flex-[0_0_220px]"
            >
              <Skeleton height={255} />
              <Skeleton height={12} width="70%" />
            </div>
          ))}
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <div
          aria-label={title}
          className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#555]"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-[0_0_170px] snap-start sm:flex-[0_0_220px]"
            >
              <PosterCard
                id={item.id}
                kind={kind}
                title={item.title}
                year={yearOf(item)}
                posterUrl={item.posterUrl}
                rating={item.averageRating}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MediaCarousel;
