import { cx } from '../../lib/cx';

export function Badge({ children, accent = false }) {
  return (
    <span
      data-accent={accent || undefined}
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold',
        accent
          ? 'border-accent bg-accent text-white'
          : 'border-line bg-surface-2 text-muted',
      )}
    >
      {children}
    </span>
  );
}
