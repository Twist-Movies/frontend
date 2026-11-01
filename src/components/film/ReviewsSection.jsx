import { useState } from 'react';
import { Button, EmptyState, ErrorState, Paginacao, SectionTitle, Textarea } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
import { criarResenha, listarResenhas } from '../../api/reviews';
import { useAsync } from '../../lib/useAsync';
import { ReviewItem } from './ReviewItem';

function NovaResenha({ tmdbId, onCreated }) {
  const [texto, setTexto] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      await criarResenha(tmdbId, {
        content: texto.trim(),
        containsSpoiler: spoiler,
      });
      setTexto('');
      setSpoiler(false);
      onCreated();
    } catch (e) {
      setErro(e);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="mb-6 flex flex-col gap-3" onSubmit={enviar}>
      <FormAviso erro={erro} />
      <Textarea
        aria-label="Escreva sua resenha"
        placeholder="Escreva sua resenha…"
        maxLength={5000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={spoiler}
            onChange={(e) => setSpoiler(e.target.checked)}
          />
          Contém spoilers
        </label>
        <Button
          type="submit"
          variant="primary"
          disabled={enviando || !texto.trim()}
        >
          {enviando ? 'Publicando…' : 'Publicar resenha'}
        </Button>
      </div>
    </form>
  );
}

export function ReviewsSection({ tmdbId }) {
  const [pagina, setPagina] = useState(1);
  const { data, error, loading, recarregar, definir } = useAsync(
    () => listarResenhas(tmdbId, pagina),
    [tmdbId, pagina],
  );

  const trocar = (atualizada) =>
    definir({
      ...data,
      results: data.results.map((r) => (r.id === atualizada.id ? atualizada : r)),
    });

  return (
    <section aria-label="Resenhas">
      <SectionTitle>Resenhas</SectionTitle>
      <NovaResenha tmdbId={tmdbId} onCreated={recarregar} />

      {error && <ErrorState error={error} onRetry={recarregar} />}
      {loading && !data && <p className="text-muted">Carregando resenhas…</p>}

      {data && data.results.length === 0 && (
        <EmptyState
          title="Nenhuma resenha ainda"
          description="Seja o primeiro a escrever sobre este filme."
        />
      )}

      {data && data.results.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.results.map((review) => (
            <ReviewItem key={review.id} review={review} onChange={trocar} />
          ))}
        </div>
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
  );
}
