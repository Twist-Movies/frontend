import { useState } from 'react';
import {
  Clock,
  Eye,
  Heart,
  ListPlus,
  MessageSquare,
  ThumbsDown,
} from 'lucide-react';
import { StarRating } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
import { cx } from '../../lib/cx';
import {
  adicionarAWatchlist,
  avaliarFilme,
  desmarcarAssistido,
  marcarAssistido,
  reagirAoFilme,
  removerAvaliacao,
  removerDaWatchlist,
  removerReacao,
} from '../../api/movies';

function BotaoIcone({ rotulo, icone: Icone, ativo, cor, preenchido, ...rest }) {
  const pressionavel = ativo !== undefined;
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      aria-pressed={pressionavel ? ativo : undefined}
      className={cx(
        'inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface-2 transition hover:enabled:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50',
        ativo ? (cor ?? 'text-accent') : 'text-muted hover:enabled:text-fg',
        ativo && 'border-current',
      )}
      {...rest}
    >
      <Icone
        className="size-5"
        aria-hidden="true"
        fill={ativo && preenchido ? 'currentColor' : 'none'}
      />
    </button>
  );
}

export function FilmActions({ tmdbId, estado, onChanged, onAddToList }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState(null);

  async function executar(acao) {
    if (ocupado) return;
    setOcupado(true);
    setErro(null);
    try {
      await acao();
      onChanged();
    } catch (e) {
      setErro(e);
    } finally {
      setOcupado(false);
    }
  }

  const alternar = (ativo, ligar, desligar) =>
    executar(() => (ativo ? desligar(tmdbId) : ligar(tmdbId)));

  const reacao = (tipo) =>
    executar(() =>
      estado.reaction === tipo
        ? removerReacao(tmdbId)
        : reagirAoFilme(tmdbId, tipo),
    );

  // Clicar na nota atual remove a avaliação.
  const avaliar = (nota) =>
    executar(() =>
      nota === estado.rating
        ? removerAvaliacao(tmdbId)
        : avaliarFilme(tmdbId, nota),
    );

  function irParaComentarios(e) {
    const alvo = document.getElementById('comentarios');
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex flex-col gap-5" data-testid="film-actions">
      <FormAviso erro={erro} />

      <div className="flex flex-wrap items-center gap-2">
        <BotaoIcone
          rotulo="Assistido"
          icone={Eye}
          ativo={estado.watched}
          cor="text-success"
          disabled={ocupado}
          onClick={() =>
            alternar(estado.watched, marcarAssistido, desmarcarAssistido)
          }
        />
        <BotaoIcone
          rotulo="Quero assistir"
          icone={Clock}
          ativo={estado.in_watchlist}
          disabled={ocupado}
          onClick={() =>
            alternar(
              estado.in_watchlist,
              adicionarAWatchlist,
              removerDaWatchlist,
            )
          }
        />
        <BotaoIcone
          rotulo="Adicionar a uma lista"
          icone={ListPlus}
          onClick={onAddToList}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2 p-4">
        <span className="text-xs font-bold tracking-wider text-muted uppercase">
          Sua nota
        </span>
        <StarRating
          size="lg"
          value={estado.rating ?? 0}
          onChange={avaliar}
          label="Sua nota"
        />
        {estado.rating && (
          <span className="text-sm text-faint">
            Clique na mesma estrela para remover.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BotaoIcone
          rotulo="Gostei"
          icone={Heart}
          ativo={estado.reaction === 'LIKE'}
          cor="text-red-500"
          preenchido
          disabled={ocupado}
          onClick={() => reacao('LIKE')}
        />
        <BotaoIcone
          rotulo="Não gostei"
          icone={ThumbsDown}
          ativo={estado.reaction === 'DISLIKE'}
          cor="text-fg"
          disabled={ocupado}
          onClick={() => reacao('DISLIKE')}
        />
        <a
          href="#comentarios"
          onClick={irParaComentarios}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-fg transition hover:bg-surface-2 sm:ml-auto"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Escrever um comentário
        </a>
      </div>
    </div>
  );
}
