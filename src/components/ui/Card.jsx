import { cx } from '../../lib/cx';

export function Card({ flush = false, className = '', children, ...rest }) {
  return (
    <div
      data-flush={flush || undefined}
      className={cx(
        'rounded-xl border border-line bg-surface',
        flush ? 'overflow-hidden' : 'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
