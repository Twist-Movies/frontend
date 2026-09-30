import { PosterGrid } from './PosterGrid';

const BASE = 'block rounded-md bg-surface-2 animate-pulse-soft motion-reduce:animate-none';

export function Skeleton({ width = '100%', height = 16, radius }) {
  return (
    <span
      data-slot="skeleton"
      className={BASE}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** Grade de pôsteres em carregamento, para reuso nas telas de catálogo. */
export function PosterGridSkeleton({ count = 12 }) {
  return (
    <PosterGrid aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <span className={`${BASE} aspect-2/3`} />
          <Skeleton height={12} width="80%" />
        </div>
      ))}
    </PosterGrid>
  );
}
