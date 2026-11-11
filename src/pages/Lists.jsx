import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListVideo } from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  Paginacao,
  SectionTitle,
  Skeleton,
} from '../components/ui';
import { ListaCard } from '../components/lists/ListaCard';
import { PlaylistFormModal } from '../components/lists/PlaylistFormModal';
import { listarPlaylists, listarPlaylistsOficiais } from '../api/playlists';
import { useAsync } from '../lib/useAsync';

const GRADE = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

// Listas públicas da equipe. Se a rota falhar ou vier vazia, a seção some.
function ListasDaEquipe() {
  const { data, error } = useAsync(() => listarPlaylistsOficiais(1), []);

  if (error || !data || (data.results ?? []).length === 0) return null;

  return (
    <section aria-label="Listas da equipe Twist" className="flex flex-col">
      <SectionTitle>Listas da equipe Twist</SectionTitle>
      <ul className={GRADE}>
        {data.results.map((lista) => (
          <li key={lista.id}>
            <ListaCard lista={lista} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Lists() {
  const [pagina, setPagina] = useState(1);
  const [criando, setCriando] = useState(false);
  const navigate = useNavigate();
  const { data, error, loading, recarregar } = useAsync(
    () => listarPlaylists(pagina),
    [pagina],
  );

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Minhas listas" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black sm:text-3xl">Minhas listas</h1>
          <Button variant="primary" onClick={() => setCriando(true)}>
            + Nova lista
          </Button>
        </div>

        {error && <ErrorState error={error} onRetry={recarregar} />}
        {loading && !data && <Skeleton height={96} />}

        {data?.results.length === 0 && (
          <EmptyState
            icon={ListVideo}
            title="Você ainda não criou nenhuma lista"
            description="Agrupe filmes por tema, humor ou o que quiser e compartilhe com quem você segue."
            action={
              <Button variant="primary" onClick={() => setCriando(true)}>
                Criar minha primeira lista
              </Button>
            }
          />
        )}

        {data && data.results.length > 0 && (
          <ul className={GRADE}>
            {data.results.map((lista) => (
              <li key={lista.id}>
                <ListaCard lista={lista} />
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
      </section>

      <ListasDaEquipe />

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
