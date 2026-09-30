import { useId } from 'react';
import { cx } from '../../lib/cx';

/** Envolve um controle e cuida de label, id e mensagem de erro. */
export function Field({ label, error, hint, children }) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          className="text-xs font-bold tracking-wider text-muted uppercase"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      {children(id)}
      {hint && !error && <span className="text-sm text-faint">{hint}</span>}
      {error && (
        <span className="text-sm text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

const CONTROLE =
  'w-full rounded-lg border bg-surface-2 px-3 py-2 min-h-9 text-fg placeholder:text-faint focus:border-accent focus:outline-none';

export function Input({ invalid, className = '', ...rest }) {
  return (
    <input
      className={cx(
        CONTROLE,
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({ invalid, className = '', ...rest }) {
  return (
    <textarea
      className={cx(
        CONTROLE,
        'min-h-28 resize-y',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
