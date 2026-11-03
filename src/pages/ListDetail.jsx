import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  PosterCard,
  PosterGrid,
  Skeleton,
} from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { PlaylistFormModal } from '../components/lists/PlaylistFormModal';
import { useAuth } from '../auth';
import {
  excluirPlaylist,
  obterPlaylist,
  removerFilmeDaPlaylist,
} from '../api/playlists';
import { useAsync } from '../lib/useAsync';
import { anoDe, imagemTmdb } from '../lib/tmdbImage';

export default function ListDetail() {
  const { listId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [falha, setFalha] = useState(null);
  const { data: lista, error, loading, recarregar } = useAsync(
    () => obterPlaylist(listId),
    [listId],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!lista) return loading ? <Skeleton height={120} /> : null;

  const dono = lista.owner_username === session?.username;

  async function remover(tmdbId) {
    setFalha(null);
    try {
      await removerFilmeDaPlaylist(lista.id, tmdbId);
      recarregar();
    } catch (e) {
      setFalha(e);
    }
  }

  async function excluir() {
    setFalha(null);
    try {
      await excluirPlaylist(lista.id);
      navigate('/listas', { replace: true });
    } catch (e) {
      setConfirmando(false);
      setFalha(e);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black">{lista.name}</h1>
          <Badge>{lista.is_public ? 'Pública' : 'Privada'}</Badge>
        </div>
        <p className="text-sm text-muted">
          Lista de{' '}
          <Link to={`/u/${lista.owner_username}`} className="font-bold text-fg">
            {lista.owner_username}
          </Link>{' '}
          · {lista.movies_count} filmes
        </p>
        {lista.description && <p className="max-w-prose">{lista.description}</p>}
        {dono && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setEditando(true)}>
              Editar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmando(true)}>
              Excluir
            </Button>
          </div>
        )}
      </header>

      <FormAviso erro={falha} />

      {lista.movies.length === 0 ? (
        <EmptyState
          title="Esta lista ainda está vazia"
          description="Abra um filme e use “Adicionar a uma lista”."
        />
      ) : (
        <PosterGrid aria-label="Filmes da lista">
          {lista.movies.map(({ movie }) => (
            <div key={movie.tmdb_id} className="flex flex-col gap-2">
              <PosterCard
                id={movie.tmdb_id}
                title={movie.title}
                year={anoDe(movie.release_date)}
                posterUrl={imagemTmdb(movie.poster_path)}
              />
              {dono && (
                <Button
                  size="sm"
                  variant="quiet"
                  aria-label={`Remover ${movie.title} da lista`}
                  onClick={() => remover(movie.tmdb_id)}
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
        </PosterGrid>
      )}

      {editando && (
        <PlaylistFormModal
          open
          playlist={lista}
          onClose={() => setEditando(false)}
          onSaved={() => {
            setEditando(false);
            recarregar();
          }}
        />
      )}

      <Modal
        open={confirmando}
        title="Excluir lista"
        onClose={() => setConfirmando(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={excluir}>
              Excluir definitivamente
            </Button>
          </>
        }
      >
        <p>Tem certeza que quer excluir “{lista.name}”? Isso não pode ser desfeito.</p>
      </Modal>
    </div>
  );
}
