import { agruparEquipe } from '../../lib/filme';

export function Equipe({ equipe = [], onSelecionar }) {
  const grupos = agruparEquipe(equipe);
  if (grupos.length === 0) return null;

  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {grupos.map((grupo) => (
        <div key={grupo.id}>
          <dt className="text-xs font-bold tracking-wider text-muted uppercase">
            {grupo.titulo}
          </dt>
          <dd className="flex flex-wrap gap-x-2">
            {grupo.pessoas.map((pessoa, i) => (
              <span key={pessoa.id ?? pessoa.name}>
                {pessoa.id && onSelecionar ? (
                  <button
                    type="button"
                    onClick={() => onSelecionar(pessoa)}
                    className="cursor-pointer font-semibold hover:underline"
                  >
                    {pessoa.name}
                  </button>
                ) : (
                  <span className="font-semibold">{pessoa.name}</span>
                )}
                {i < grupo.pessoas.length - 1 && ','}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
