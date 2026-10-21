import * as real from '../api/auth';
import * as simulado from '../api/auth.mock';

export function authService() {
  return import.meta.env.VITE_API_MOCK === 'false' ? real : simulado;
}
