import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { LogFilmModal } from './LogFilmModal';
import { useAuth } from '../../auth';

export function AppShell() {
  const [logOpen, setLogOpen] = useState(false);
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        username={session?.username ?? ''}
        avatarUrl={session?.avatarUrl}
        onLogFilm={() => setLogOpen(true)}
        onSignOut={signOut}
      />

      <main className="flex-1 pt-8 pb-12">
        <div className="wrap">
          <Outlet />
        </div>
      </main>

      <Footer />

      <LogFilmModal open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
