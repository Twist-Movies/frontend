export const METRICAS = ['lines', 'statements', 'functions', 'branches'];

export const MARCADOR = '<!-- twist-cobertura -->';

export function faixa(pct) {
  if (pct >= 80) return '🟢 Meta';
  if (pct >= 60) return '🟡 Atenção';
  return '🔴 Crítico';
}

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
