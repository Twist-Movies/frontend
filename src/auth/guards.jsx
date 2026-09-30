import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Protege a área autenticada. Guarda o destino pretendido em `state.from`
 * para que o login devolva o usuário exatamente onde ele tentou entrar.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'visitante') {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/** Impede quem já está autenticado de voltar para landing, login ou cadastro. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth();

  if (status === 'autenticado') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
