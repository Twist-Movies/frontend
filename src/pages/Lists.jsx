import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Paginacao,
  Skeleton,
} from '../components/ui';
import { PlaylistFormModal } from '../components/lists/PlaylistFormModal';
import { listarPlaylists } from '../api/playlists';
import { useAsync } from '../lib/useAsync';

export default function Lists() {
  const [pagina, setPagina] = useState(1);
  const [criando, setCriando] = useState(false);
  const navigate = useNavigate();
  const { data, error, loading, recarregar } = useAsync(
    () => listarPlaylists(pagina),
    [pagina],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Minhas listas</h1>
        <Button variant="primary" onClick={() => setCriando(true)}>
          + Nova lista
        </Button>
      </div>

      {error && <ErrorState error={error} onRetry={recarregar} />}
      {loading && !data && <Skeleton height={96} />}

      {data?.results.length === 0 && (
        <EmptyState
          title="Você ainda não criou nenhuma lista"
          description="Agrupe filmes por tema, humor ou o que quiser."
        />
      )}

      {data && data.results.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((lista) => (
            <li key={lista.id}>
              <Link to={`/lista/${lista.id}`} className="block">
                <Card className="flex h-full flex-col gap-2 hover:border-accent">
                  {lista.cover_url && (
                    <img
                      src={lista.cover_url}
                      alt=""
                      className="aspect-video w-full rounded-md object-cover"
                    />
                  )}
                  <span className="font-bold">{lista.name}</span>
                  {lista.description && (
                    <p className="line-clamp-2 text-sm text-muted">
                      {lista.description}
                    </p>
                  )}
                  <div>
                    <Badge>{lista.is_public ? 'Pública' : 'Privada'}</Badge>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <Paginacao
          pagina={pagina}
          temAnterior={Boolean(data.previous)}
          temProxima={Boolean(data.next)}
          onChange={setPagina}
        />
      )}

      {criando && (
        <PlaylistFormModal
          open
          onClose={() => setCriando(false)}
          onSaved={(lista) => navigate(`/lista/${lista.id}`)}
        />
      )}
    </div>
  );
}
