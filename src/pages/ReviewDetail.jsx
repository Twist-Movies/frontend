import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  ErrorState,
  Modal,
  Skeleton,
  Textarea,
} from '../components/ui';
import { FormAviso } from '../auth/FormAviso';
import { ReviewItem } from '../components/film/ReviewItem';
import { useAuth } from '../auth';
import { editarResenha, excluirResenha, obterResenha } from '../api/reviews';
import { useAsync } from '../lib/useAsync';
import { anoDe } from '../lib/tmdbImage';

function EditarResenha({ review, onSaved, onCancel }) {
  const [texto, setTexto] = useState(review.content);
  const [spoiler, setSpoiler] = useState(review.contains_spoiler);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      onSaved(
        await editarResenha(review.id, {
          content: texto.trim(),
          containsSpoiler: spoiler,
        }),
      );
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={salvar}>
      <FormAviso erro={erro} />
      <Textarea
        aria-label="Editar resenha"
        maxLength={5000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={spoiler}
          onChange={(e) => setSpoiler(e.target.checked)}
        />
        Contém spoilers
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={salvando || !texto.trim()}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function ReviewDetail() {
  const { reviewId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [falha, setFalha] = useState(null);
  const { data: review, error, loading, recarregar, definir } = useAsync(
    () => obterResenha(reviewId),
    [reviewId],
  );

  if (error) return <ErrorState error={error} onRetry={recarregar} />;
  if (!review) return loading ? <Skeleton height={120} /> : null;

  const autor = review.author.username === session?.username;
  const { movie } = review;

  async function excluir() {
    setFalha(null);
    try {
      await excluirResenha(review.id);
      navigate(`/filme/${movie.tmdb_id}`, { replace: true });
    } catch (e) {
      setConfirmando(false);
      setFalha(e);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">Resenha de</p>
        <h1 className="text-3xl font-black">
          <Link to={`/filme/${movie.tmdb_id}`} className="hover:text-accent">
            {movie.title}
          </Link>
          {anoDe(movie.release_date) && (
            <span className="text-xl font-normal text-faint">
              {' '}
              {anoDe(movie.release_date)}
            </span>
          )}
        </h1>
      </header>

      <FormAviso erro={falha} />

      {editando ? (
        <EditarResenha
          review={review}
          onCancel={() => setEditando(false)}
          onSaved={(atualizada) => {
            definir({ ...review, ...atualizada });
            setEditando(false);
          }}
        />
      ) : (
        <ReviewItem review={review} onChange={definir} />
      )}

      {autor && !editando && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setEditando(true)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmando(true)}>
            Excluir
          </Button>
        </div>
      )}

      <Modal
        open={confirmando}
        title="Excluir resenha"
        onClose={() => setConfirmando(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={excluir}>
              Excluir
            </Button>
          </>
        }
      >
        <p>Tem certeza que quer excluir esta resenha?</p>
      </Modal>
    </div>
  );
}
