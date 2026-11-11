import { useRef, useState } from 'react';
import { cx } from '../../lib/cx';

const STAR = '★';

const SIZES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-[1.75rem] sm:text-[2.5rem]',
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

function rotuloDaNota(nota) {
  if (nota === 1) return '1 estrela';
  if (nota === 0.5) return '0,5 estrela';
  return `${String(nota).replace('.', ',')} estrelas`;
}

const NOTAS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const PASSOS = {
  ArrowRight: 0.5,
  ArrowUp: 0.5,
  ArrowLeft: -0.5,
  ArrowDown: -0.5,
};

// Cada estrela tem duas metades clicáveis: esquerda = x,5 e direita = inteira.
export function StarRating({ value, onChange, size = 'md', label }) {
  const interactive = typeof onChange === 'function';
  const [hover, setHover] = useState(null);
  const refs = useRef({});
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

  const exibido = hover ?? value;
  const focavel = NOTAS.includes(value) ? value : 0.5;

  function aoTeclar(e) {
    const passo = PASSOS[e.key];
    if (!passo) return;
    e.preventDefault();
    const atual = NOTAS.includes(value) ? value : 0;
    const proxima = Math.min(5, Math.max(0.5, atual + passo));
    if (proxima === value) return;
    refs.current[proxima]?.focus();
    onChange(proxima);
  }

  const metade = (nota, lado) => (
    <button
      ref={(el) => {
        refs.current[nota] = el;
      }}
      type="button"
      role="radio"
      aria-checked={value === nota}
      aria-label={rotuloDaNota(nota)}
      tabIndex={focavel === nota ? 0 : -1}
      onClick={() => onChange(nota)}
      onMouseEnter={() => setHover(nota)}
      onKeyDown={aoTeclar}
      className={cx(
        'absolute inset-y-0 w-1/2 cursor-pointer rounded-sm border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-accent',
        lado === 'esq' ? 'left-0' : 'right-0',
      )}
    />
  );

  return (
    <span
      className={base}
      role="radiogroup"
      aria-label={label ?? 'Nota'}
      onMouseLeave={() => setHover(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="relative inline-block">
          <StarGlyph fill={fillFor(i, exibido)} />
          {metade(i + 0.5, 'esq')}
          {metade(i + 1, 'dir')}
        </span>
      ))}
    </span>
  );
}
