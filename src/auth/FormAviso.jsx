import { cx } from '../lib/cx';
import { ApiError } from '../api/errors';

export function FormAviso({ erro }) {
  if (!erro) return null;

  const deServidor = !(erro instanceof ApiError) || !erro.isClientError;

  const mensagem =
    erro instanceof ApiError
      ? erro.message
      : 'Não foi possível completar a operação. Tente novamente em instantes.';

  return (
    <div
      role="alert"
      data-tone={deServidor ? 'servidor' : 'cliente'}
      className={cx(
        'rounded-lg border border-l-3 border-line bg-surface-2 p-3 text-sm',
        deServidor ? 'border-l-danger' : 'border-l-muted',
      )}
    >
      {mensagem}
    </div>
  );
}
