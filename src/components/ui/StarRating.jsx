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
      <span
        data-fill="half"
        className="relative inline-block"
        aria-hidden="true"
      >
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

  return (
    <span className={base} role="radiogroup" aria-label={label ?? 'Nota'}>
      {[1, 2, 3, 4, 5].map((nota) => (
        <button
          key={nota}
          type="button"
          role="radio"
          aria-checked={value === nota}
          aria-label={nota === 1 ? '1 estrela' : `${nota} estrelas`}
          onClick={() => onChange(nota)}
          className="cursor-pointer border-0 bg-transparent p-0 hover:[&>[data-fill]]:text-accent"
        >
          <StarGlyph fill={value >= nota ? 'full' : 'empty'} />
        </button>
      ))}
    </span>
  );
}
