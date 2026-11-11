import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';

// Um filme por linha: capa, título, ano, nota e sinopse (modo "Lista").
export function FilmeLinha({ id, title, year, posterUrl, rating, overview }) {
  return (
    <Link
      to={`/filme/${id}`}
      className="group flex gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-accent sm:gap-4"
      aria-label={`${title}${year ? ` (${year})` : ''}`}
    >
      <div className="flex aspect-2/3 w-20 flex-none items-center justify-center overflow-hidden rounded-md border border-line bg-surface-2 text-center sm:w-24">
        {posterUrl ? (
          <img src={posterUrl} alt="" className="size-full object-cover" />
        ) : (
          <span
            data-slot="placeholder"
            className="p-1 text-xs leading-tight font-semibold text-faint"
          >
            {title}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold group-hover:text-accent">{title}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {year && <span className="text-sm text-faint">{year}</span>}
          {rating !== undefined && <StarRating value={rating} size="sm" />}
        </div>
        {overview ? (
          <p className="line-clamp-3 text-sm text-muted sm:line-clamp-4">
            {overview}
          </p>
        ) : (
          <p className="text-sm text-faint">Sem sinopse disponível.</p>
        )}
      </div>
    </Link>
  );
}
