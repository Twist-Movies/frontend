import * as real from '../api/auth';
import * as simulado from '../api/auth.mock';

/**
 * Escolhe a autenticação: a da API do Django ou a simulada. O padrão é a
 * simulada, para qualquer pessoa da equipe rodar o front sem subir o back.
 * Com VITE_API_MOCK=false no .env.local, o front fala com a API real.
 */
export function authService() {
  return import.meta.env.VITE_API_MOCK === 'false' ? real : simulado;
}
