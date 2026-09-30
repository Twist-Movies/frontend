/**
 * Imprime a cobertura do front-end como tabela markdown, classificada nas
 * faixas de controle da ficha do indicador 5 (meta >= 80%, atenção 60–79%,
 * crítico < 60%). O CI redireciona a saída para o sumário da execução.
 */
import { readFileSync } from "node:fs";

const ARQUIVO = "coverage/coverage-summary.json";
const METRICAS = ["lines", "statements", "functions", "branches"];

function faixa(pct) {
  if (pct >= 80) return "Meta";
  if (pct >= 60) return "Atenção";
  return "Crítico";
}

let total;
try {
  total = JSON.parse(readFileSync(ARQUIVO, "utf8")).total;
} catch {
  console.log(`Relatório de cobertura não encontrado em \`${ARQUIVO}\`.`);
  process.exit(0);
}

const linhas = [
  "## Cobertura do front-end (indicador 5)",
  "",
  "| Métrica | % | Faixa |",
  "|---|---|---|",
  ...METRICAS.map((m) => `| ${m} | ${total[m].pct}% | ${faixa(total[m].pct)} |`),
];

console.log(linhas.join("\n"));
