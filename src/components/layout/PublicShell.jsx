import { Outlet, useLocation } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

/** Moldura das telas de visitante: landing, login e cadastro. */
export function PublicShell() {
  const { pathname } = useLocation();
  const landing = pathname === '/boas-vindas';

  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader overlay={landing} />

      <main className={landing ? 'flex-1' : 'flex-1 px-4 pt-12 pb-16'}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
