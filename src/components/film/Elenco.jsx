import { useState } from 'react';
import { imagemTmdb } from '../../lib/tmdbImage';
import { inicial } from '../../lib/filme';
import { Button } from '../ui';

const PRINCIPAIS = 3;

function Foto({ pessoa }) {
  const foto = imagemTmdb(pessoa.profile_path, 'w185');
  return (
    <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-xl font-bold text-faint">
      {foto ? (
        <img src={foto} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{inicial(pessoa.name)}</span>
      )}
    </span>
  );
}

function Membro({ pessoa, onSelecionar }) {
  const conteudo = (
    <>
      <Foto pessoa={pessoa} />
      <span className="flex min-w-0 flex-col text-left">
        <span className="font-semibold">{pessoa.name}</span>
        {pessoa.character && (
          <span className="text-sm text-muted">{pessoa.character}</span>
        )}
      </span>
    </>
  );
  if (pessoa.id && onSelecionar) {
    return (
      <button
        type="button"
        aria-label={`Ver detalhes de ${pessoa.name}`}
        onClick={() => onSelecionar(pessoa)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-1 text-left transition hover:bg-surface-2"
      >
        {conteudo}
      </button>
    );
  }
  return <div className="flex items-center gap-3 p-1">{conteudo}</div>;
}

export function Elenco({ elenco = [], onSelecionar }) {
  const [completo, setCompleto] = useState(false);
  if (elenco.length === 0) return null;
  const visiveis = completo ? elenco : elenco.slice(0, PRINCIPAIS);

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((pessoa, i) => (
          <li key={`${pessoa.id ?? pessoa.name}-${pessoa.character}-${i}`}>
            <Membro pessoa={pessoa} onSelecionar={onSelecionar} />
          </li>
        ))}
      </ul>
      {elenco.length > PRINCIPAIS && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={completo}
            onClick={() => setCompleto((v) => !v)}
          >
            {completo ? 'Mostrar menos' : 'Ver elenco completo'}
          </Button>
        </div>
      )}
    </div>
  );
}
