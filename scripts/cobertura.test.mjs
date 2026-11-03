import { describe, expect, it } from 'vitest';
import { MARCADOR, faixa, montarResumo } from './cobertura.mjs';

const metrica = (pct) => ({ pct, covered: pct, total: 100 });

describe('faixa', () => {
  it('segue as faixas da ficha do indicador 5', () => {
    expect(faixa(80)).toMatch(/Meta/);
    expect(faixa(79.9)).toMatch(/Atenção/);
    expect(faixa(60)).toMatch(/Atenção/);
    expect(faixa(59.9)).toMatch(/Crítico/);
  });
});

describe('montarResumo', () => {
  const total = {
    lines: metrica(98),
    statements: metrica(97),
    functions: metrica(75),
    branches: metrica(90),
  };

  it('começa pelo marcador para o CI achar o comentário', () => {
    expect(montarResumo(total).startsWith(MARCADOR)).toBe(true);
  });

  it('classifica a situação geral pela pior métrica', () => {
    expect(montarResumo(total)).toContain(
      'Situação geral: **🟡 Atenção** (pior métrica: 75%)',
    );
  });

  it('traz uma linha por métrica', () => {
    const resumo = montarResumo(total);
    expect(resumo).toContain('| lines | 98% | 98 / 100 | 🟢 Meta |');
    expect(resumo).toContain('| functions | 75% | 75 / 100 | 🟡 Atenção |');
  });
});
