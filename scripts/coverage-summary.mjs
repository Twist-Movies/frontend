/**
 * Imprime o resumo da cobertura em markdown. O CI redireciona a saída para o
 * sumário da execução e para o comentário do pull request.
 */
import { readFileSync } from 'node:fs';
import { montarResumo } from './cobertura.mjs';

const ARQUIVO = 'coverage/coverage-summary.json';

let total;
try {
  total = JSON.parse(readFileSync(ARQUIVO, 'utf8')).total;
} catch {
  console.log(`Relatório de cobertura não encontrado em \`${ARQUIVO}\`.`);
  process.exit(0);
}

console.log(montarResumo(total));
