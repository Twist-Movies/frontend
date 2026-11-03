import { useState } from 'react';
import { Button, StarRating } from '../ui';
import { FormAviso } from '../../auth/FormAviso';
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

  const botao = (rotulo, ativo, aoClicar) => (
    <Button
      variant={ativo ? 'primary' : 'default'}
      aria-pressed={ativo}
      disabled={ocupado}
      onClick={aoClicar}
    >
      {rotulo}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4" data-testid="film-actions">
      <FormAviso erro={erro} />

      <div className="flex flex-wrap gap-2">
        {botao('Assistido', estado.watched, () =>
          alternar(estado.watched, marcarAssistido, desmarcarAssistido),
        )}
        {botao('Quero assistir', estado.in_watchlist, () =>
          alternar(
            estado.in_watchlist,
            adicionarAWatchlist,
            removerDaWatchlist,
          ),
        )}
        {botao('Gostei', estado.reaction === 'LIKE', () => reacao('LIKE'))}
        {botao('Não gostei', estado.reaction === 'DISLIKE', () =>
          reacao('DISLIKE'),
        )}
        <Button variant="ghost" onClick={onAddToList}>
          Adicionar a uma lista
        </Button>
      </div>

      <div className="flex items-center gap-3">
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
    </div>
  );
}
