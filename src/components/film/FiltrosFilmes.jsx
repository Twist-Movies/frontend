import { useId } from 'react';
import { Button } from '../ui';
import {
  DECADAS,
  DURACOES,
  GENEROS,
  NOTAS,
  ORDENACOES,
} from '../../lib/filtrosFilmes';

const CONTROLE =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 min-h-9 text-fg focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

function Seletor({
  rotulo,
  valor,
  onChange,
  opcoes,
  vazio,
  desabilitado,
  dica,
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold tracking-wider text-muted uppercase"
      >
        {rotulo}
      </label>
      <select
        id={id}
        className={CONTROLE}
        value={valor}
        disabled={desabilitado}
        title={desabilitado ? dica : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {vazio && <option value="">{vazio}</option>}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}

const DICA = 'Disponível quando o back-end oferecer o catálogo de filmes.';

// `catalogo` = false: sem rota de catálogo no back; gênero e duração ficam
// indisponíveis e "popularidade" vira "relevância" (ordem do TMDB).
export function FiltrosFilmes({
  filtros,
  catalogo,
  podeLimpar,
  onChange,
  onLimpar,
}) {
  const ordenacoes = ORDENACOES.map(({ id, rotulo }) => ({
    valor: id,
    rotulo: id === 'popularidade' && !catalogo ? 'Relevância' : rotulo,
  }));

  return (
    <section aria-label="Filtros" className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Seletor
          rotulo="Gênero"
          vazio="Todos"
          valor={filtros.genero}
          desabilitado={!catalogo}
          dica={DICA}
          opcoes={GENEROS.map((g) => ({ valor: String(g.id), rotulo: g.nome }))}
          onChange={(valor) => onChange('genero', valor)}
        />
        <Seletor
          rotulo="Década"
          vazio="Todas"
          valor={filtros.decada}
          opcoes={DECADAS.map((d) => ({ valor: String(d), rotulo: `${d}s` }))}
          onChange={(valor) => onChange('decada', valor)}
        />
        <Seletor
          rotulo="Duração"
          vazio="Qualquer"
          valor={filtros.duracao}
          desabilitado={!catalogo}
          dica={DICA}
          opcoes={DURACOES.map((d) => ({ valor: d.id, rotulo: d.rotulo }))}
          onChange={(valor) => onChange('duracao', valor)}
        />
        <Seletor
          rotulo="Nota mínima"
          vazio="Qualquer"
          valor={filtros.nota}
          opcoes={NOTAS.map((n) => ({ valor: n.id, rotulo: n.rotulo }))}
          onChange={(valor) => onChange('nota', valor)}
        />
        <Seletor
          rotulo="Ordenar por"
          valor={filtros.ordem}
          opcoes={ordenacoes}
          onChange={(valor) => onChange('ordem', valor)}
        />
      </div>
      {podeLimpar && (
        <div>
          <Button size="sm" variant="quiet" onClick={onLimpar}>
            Limpar filtros
          </Button>
        </div>
      )}
    </section>
  );
}
