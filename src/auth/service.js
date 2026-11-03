import * as real from '../api/auth';
import * as simulado from '../api/auth.mock';

export function usandoApiReal() {
  // A API real é o padrão; o modo simulado só liga com VITE_API_MOCK=true.
  return import.meta.env.VITE_API_MOCK !== 'true';
}

export function authService() {
  return usandoApiReal() ? real : simulado;
}
