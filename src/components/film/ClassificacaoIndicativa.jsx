import { classificacaoIndicativa } from '../../lib/filme';
import { cx } from '../../lib/cx';

// Selo quadrado no padrão do Ministério da Justiça. Valor desconhecido: nada.
export function ClassificacaoIndicativa({ valor }) {
  const selo = classificacaoIndicativa(valor);
  if (!selo) return null;

  return (
    <span
      role="img"
      aria-label={`Classificação indicativa: ${selo.rotulo}`}
      title={`Classificação indicativa: ${selo.rotulo}`}
      data-classificacao={selo.texto}
      className={cx(
        'inline-flex size-8 items-center justify-center rounded-md border-2 border-white/80 text-base leading-none font-black shadow-sm',
        selo.cor,
      )}
    >
      <span aria-hidden="true">{selo.texto}</span>
    </span>
  );
}
