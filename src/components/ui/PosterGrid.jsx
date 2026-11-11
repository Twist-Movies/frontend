import { cx } from '../../lib/cx';

// No máximo 6 colunas: 3 no mobile, 4 (sm), 5 (md) e 6 (lg+).
export function PosterGrid({ className = '', children, ...rest }) {
  return (
    <div
      data-slot="poster-grid"
      className={cx(
        'grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
