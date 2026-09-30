import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService } from './service';
import * as real from '../api/auth';
import * as simulado from '../api/auth.mock';

describe('authService', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('usa a autenticação simulada por padrão', () => {
    expect(authService()).toBe(simulado);
  });

  it('usa a API real com VITE_API_MOCK=false', () => {
    vi.stubEnv('VITE_API_MOCK', 'false');
    expect(authService()).toBe(real);
  });
});
