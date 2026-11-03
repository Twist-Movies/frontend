import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card } from '../ui';
import { curtirResenha, descurtirResenha } from '../../api/reviews';
import { formatarData } from '../../lib/formatar';

export function ReviewItem({ review, onChange }) {
  const [revelado, setRevelado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const escondido = review.contains_spoiler && !revelado;

  async function alternarCurtida() {
    if (ocupado) return;
    setOcupado(true);
    try {
      if (review.liked_by_me) await descurtirResenha(review.id);
      else await curtirResenha(review.id);
      onChange({
        ...review,
        liked_by_me: !review.liked_by_me,
        likes_count: review.likes_count + (review.liked_by_me ? -1 : 1),
      });
    } catch {
      // Sem alteração local: o contador continua o que o servidor devolveu.
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Card>
      <article className="flex items-start gap-3">
        <Avatar name={review.author.username} src={review.author.avatar_url} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-bold">{review.author.username}</span>
            <Link
              to={`/resenha/${review.id}`}
              className="text-faint hover:text-fg"
            >
              {formatarData(review.created_at)}
            </Link>
          </div>

          {escondido ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted">Esta resenha contém spoilers.</p>
              <Button size="sm" onClick={() => setRevelado(true)}>
                Mostrar mesmo assim
              </Button>
            </div>
          ) : (
            <p className="break-words whitespace-pre-line">{review.content}</p>
          )}

          <div>
            <Button
              size="sm"
              variant={review.liked_by_me ? 'primary' : 'ghost'}
              aria-pressed={review.liked_by_me}
              disabled={ocupado}
              onClick={alternarCurtida}
            >
              {review.liked_by_me ? 'Curtida' : 'Curtir'} · {review.likes_count}
            </Button>
          </div>
        </div>
      </article>
    </Card>
  );
}
