import { cx } from '../../lib/cx';

const STAR = '★';

const SIZES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-[1.75rem]',
};

function StarGlyph({ fill }) {
  if (fill === 'half') {
    return (
      <span data-fill="half" className="relative inline-block" aria-hidden="true">
        <span className="text-faint">{STAR}</span>
        <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden text-star">
          {STAR}
        </span>
      </span>
    );
  }

  return (
    <span
      data-fill={fill}
      className={cx(
        'transition-colors',
        fill === 'full' ? 'text-star' : 'text-faint',
      )}
      aria-hidden="true"
    >
      {STAR}
    </span>
  );
}

function fillFor(starIndex, value) {
  if (value >= starIndex + 1) return 'full';
  if (value >= starIndex + 0.5) return 'half';
  return 'empty';
}

/**
 * Exibe (e opcionalmente edita) uma nota de 0 a 5 com meias-estrelas.
 * Sem onChange é somente leitura. Com onChange vira um radiogroup navegável
 * por teclado — cada estrela tem duas zonas de clique (meia e cheia).
 */
export function StarRating({ value, onChange, size = 'md', label }) {
  const interactive = typeof onChange === 'function';
  const text = value > 0 ? `${value} de 5 estrelas` : 'sem nota';
  const base = cx('inline-flex items-center gap-px leading-none', SIZES[size]);

  if (!interactive) {
    return (
      <span className={base} role="img" aria-label={label ?? text}>
        {[0, 1, 2, 3, 4].map((i) => (
          <StarGlyph key={i} fill={fillFor(i, value)} />
        ))}
      </span>
    );
  }

  const zona =
    'absolute top-0 z-1 m-0 h-full w-1/2 cursor-pointer border-0 bg-transparent p-0';

  return (
    <span className={base} role="radiogroup" aria-label={label ?? 'Nota'}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="group relative inline-block cursor-pointer [&>[data-fill]]:group-hover:text-accent"
        >
          <button
            type="button"
            className={`${zona} left-0`}
            role="radio"
            aria-checked={value === i + 0.5}
            aria-label={`${i + 0.5} estrelas`}
            onClick={() => onChange(i + 0.5)}
          />
          <button
            type="button"
            className={`${zona} right-0`}
            role="radio"
            aria-checked={value === i + 1}
            aria-label={`${i + 1} estrelas`}
            onClick={() => onChange(i + 1)}
          />
          <StarGlyph fill={fillFor(i, value)} />
        </span>
      ))}
    </span>
  );
}
