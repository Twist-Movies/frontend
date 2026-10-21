import { cx } from '../../lib/cx';

const SIZES = {
  sm: 'size-6 text-[10px]',
  md: 'size-9 text-sm',
  lg: 'size-18 text-2xl',
};

export function Avatar({ name, src, size = 'md' }) {
  const initials = name.trim().slice(0, 2);

  return (
    <span
      data-size={size}
      className={cx(
        'inline-flex flex-none items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 font-bold text-muted uppercase',
        SIZES[size],
      )}
      title={name}
    >
      {src ? <img src={src} alt="" width="100%" height="100%" /> : initials}
    </span>
  );
}
