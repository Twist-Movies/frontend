import { useContext } from 'react';
import { AuthContext } from './context';

export function useAuth() {
  const valor = useContext(AuthContext);
  if (!valor) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider.');
  }
  return valor;
}
