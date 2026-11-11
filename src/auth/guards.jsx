import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

// Enquanto o app tenta restaurar a sessão pelo cookie, não decide nada
// (evita piscar a tela de login para quem já está logado).
function Restaurando() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-screen items-center justify-center text-sm text-muted"
    >
      Carregando…
    </div>
  );
}

export function RequireAuth() {
  const { status, aviso } = useAuth();
  const location = useLocation();

  if (status === 'carregando') return <Restaurando />;
  if (status === 'visitante') {
    return (
      <Navigate
        to="/entrar"
        state={{ from: location, aviso: aviso ?? undefined }}
        replace
      />
    );
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { status } = useAuth();

  if (status === 'carregando') return <Restaurando />;
  if (status === 'autenticado') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
