import { cx } from '../lib/cx';
import { ApiError } from '../api/errors';

/**
 * Mostra a falha de um formulário de identidade.
 *
 * A distinção entre 4xx e 5xx não é estética: a ficha do indicador 3 conta
 * apenas 5xx como falha da aplicação. Credencial errada é conversa normal
 * com o usuário e não deve parecer que o sistema quebrou.
 */
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
