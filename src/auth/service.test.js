import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService, usandoApiReal } from './service';
import * as real from '../api/auth';
import * as simulado from '../api/auth.mock';

describe('authService', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('usa a API real quando VITE_API_MOCK não está definido', () => {
    vi.stubEnv('VITE_API_MOCK', '');
    expect(usandoApiReal()).toBe(true);
    expect(authService()).toBe(real);
  });

  it('usa a API real com VITE_API_MOCK=false', () => {
    vi.stubEnv('VITE_API_MOCK', 'false');
    expect(authService()).toBe(real);
  });

  it('usa a autenticação simulada só com VITE_API_MOCK=true', () => {
    vi.stubEnv('VITE_API_MOCK', 'true');
    expect(usandoApiReal()).toBe(false);
    expect(authService()).toBe(simulado);
  });
});
