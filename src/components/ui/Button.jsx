import { cx } from '../../lib/cx';

const VARIANTS = {
  default: 'bg-surface-2 text-fg hover:enabled:bg-surface-hover',
  primary: 'bg-cta text-cta-fg hover:enabled:-translate-y-0.5',
  ghost: 'border-line bg-transparent text-fg hover:enabled:bg-surface-2',
  quiet: 'bg-transparent px-2 text-muted hover:enabled:text-fg',
};

const SIZES = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export function Button({
  variant = 'default',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      data-block={block || undefined}
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-bold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
        SIZES[size],
        VARIANTS[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
