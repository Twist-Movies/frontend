import { PosterCard } from '../ui';

function MediaCarousel({ id, label, title, items, kind = 'filme', yearOf }) {
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
    </section>
  );
}

export default MediaCarousel;
