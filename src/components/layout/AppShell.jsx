import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { Modal } from '../ui';
import { useAuth } from '../../auth';

/**
 * Moldura de todas as telas autenticadas: topo fixo, conteúdo e rodapé.
 * O modal de registrar filme mora aqui porque é acionável de qualquer página —
 * o formulário completo chega na Sprint 4.
 */
export function AppShell() {
  const [logOpen, setLogOpen] = useState(false);
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        username={session?.username ?? ''}
        onLogFilm={() => setLogOpen(true)}
        onSignOut={signOut}
      />

      <main className="flex-1 pt-8 pb-12">
        <div className="wrap">
          <Outlet />
        </div>
      </main>

      <Footer />

      <Modal
        open={logOpen}
        title="Registrar filme"
        onClose={() => setLogOpen(false)}
      >
        <p className="text-muted">
          O formulário de registro — buscar filme, data assistida, nota,
          rewatch, resenha e tags — é a entrega principal da Sprint 4.
        </p>
      </Modal>
    </div>
  );
}
