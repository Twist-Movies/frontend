import { Button } from './Button';

export function Paginacao({ pagina, temAnterior, temProxima, onChange }) {
  if (!temAnterior && !temProxima) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4"
      aria-label="Paginação"
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={!temAnterior}
        onClick={() => onChange(pagina - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted">Página {pagina}</span>
      <Button
        variant="ghost"
        size="sm"
        disabled={!temProxima}
        onClick={() => onChange(pagina + 1)}
      >
        Próxima
      </Button>
    </nav>
  );
}
