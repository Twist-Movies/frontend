import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';

/**
 * Pôster clicável. Sem imagem, o quadro mostra o título como placeholder.
 * `kind` decide a rota: filme ou série.
 */
export function PosterCard({
  id,
  title,
  year,
  posterUrl,
  rating,
  kind = 'filme',
  compact = false,
}) {
  return (
    <Link
      to={`/${kind}/${id}`}
      className="group block"
      aria-label={`${title}${year ? ` (${year})` : ''}`}
    >
      <div className="flex aspect-2/3 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2 p-2 text-center transition group-hover:-translate-y-0.5 group-hover:border-accent">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            data-slot="placeholder"
            className="text-xs leading-tight font-semibold text-faint"
          >
            {title}
          </span>
        )}
      </div>
      {!compact && (
        <div className="mt-2 flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{title}</span>
          {year && <span className="text-xs text-faint">{year}</span>}
          {rating !== undefined && <StarRating value={rating} size="sm" />}
        </div>
      )}
    </Link>
  );
}
