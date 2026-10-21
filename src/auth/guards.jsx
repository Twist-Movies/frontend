import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'visitante') {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { status } = useAuth();

  if (status === 'autenticado') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
