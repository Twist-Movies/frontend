import { afterEach, describe, expect, it, vi } from 'vitest';
import { isEnabled, onlyEnabled } from './features';

describe('isEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deixa séries desligadas por padrão', () => {
    expect(isEnabled('series')).toBe(false);
  });

  it('liga séries pela variável de ambiente', () => {
    vi.stubEnv('VITE_FEATURE_SERIES', 'true');
    expect(isEnabled('series')).toBe(true);
  });

  it('desliga qualquer funcionalidade desconhecida', () => {
    expect(isEnabled('inexistente')).toBe(false);
  });
});

describe('onlyEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const itens = [{ label: 'Filmes' }, { label: 'Séries', feature: 'series' }];

  it('remove itens de funcionalidade desligada', () => {
    expect(onlyEnabled(itens).map((i) => i.label)).toEqual(['Filmes']);
  });

  it('mantém tudo quando a funcionalidade está ligada', () => {
    vi.stubEnv('VITE_FEATURE_SERIES', 'true');
    expect(onlyEnabled(itens)).toHaveLength(2);
  });
});
