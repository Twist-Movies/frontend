import { cx } from '../../lib/cx';

export function PosterGrid({ className = '', children, ...rest }) {
  return (
    <div
      data-slot="poster-grid"
      className={cx(
        'grid grid-cols-[repeat(auto-fill,minmax(95px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] sm:gap-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
