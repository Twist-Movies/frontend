import { Link } from 'react-router-dom';
import { Badge, Card } from '../ui';

export function ListaCard({ lista, mostrarDescricao = true }) {
  return (
    <Link to={`/lista/${lista.id}`} className="block h-full">
      <Card className="flex h-full flex-col gap-2 hover:border-accent">
        {lista.cover_url && (
          <img
            src={lista.cover_url}
            alt=""
            className="aspect-video w-full rounded-md object-cover"
          />
        )}
        <span className="font-bold">{lista.name}</span>
        {mostrarDescricao && lista.description && (
          <p className="line-clamp-2 text-sm text-muted">{lista.description}</p>
        )}
        <div>
          <Badge>{lista.is_public ? 'Pública' : 'Privada'}</Badge>
        </div>
      </Card>
    </Link>
  );
}
