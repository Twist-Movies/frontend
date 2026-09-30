/**
 * Resumo da cobertura do front-end, classificado nas faixas de controle da
 * ficha do indicador 5 (meta >= 80%, atenção 60–79%, crítico < 60%).
 * Usado no sumário da execução do CI e no comentário do pull request.
 */

export const METRICAS = ['lines', 'statements', 'functions', 'branches'];

/** Marca invisível que o CI usa para achar e atualizar o próprio comentário. */
export const MARCADOR = '<!-- twist-cobertura -->';

export function faixa(pct) {
  if (pct >= 80) return '🟢 Meta';
  if (pct >= 60) return '🟡 Atenção';
  return '🔴 Crítico';
}

/** Monta a tabela markdown a partir do `total` do coverage-summary.json. */
export function montarResumo(total) {
  const pior = Math.min(...METRICAS.map((m) => total[m].pct));

  return [
    MARCADOR,
    '## Cobertura do front-end (indicador 5)',
    '',
    `Situação geral: **${faixa(pior)}** (pior métrica: ${pior}%)`,
    '',
    '| Métrica | % | Cobertas / total | Faixa |',
    '|---|---|---|---|',
    ...METRICAS.map(
      (m) =>
        `| ${m} | ${total[m].pct}% | ${total[m].covered} / ${total[m].total} | ${faixa(total[m].pct)} |`,
    ),
  ].join('\n');
}
