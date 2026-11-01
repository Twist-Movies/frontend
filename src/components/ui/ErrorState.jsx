import { Button } from './Button';

export function ErrorState({ error, onRetry }) {
  const mensagem =
    error?.message ??
    'Não foi possível carregar. Tente novamente em instantes.';

  return (
    <div
      role="alert"
      className="rounded-xl border border-dashed border-danger px-4 py-10 text-center"
    >
      <p className="mb-3 text-muted">{mensagem}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
